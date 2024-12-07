import neo4j, { Driver, Transaction } from "neo4j-driver";
import {
  NEO4J_URI,
  NEO4J_DATABASE,
  NEO4J_PASSWORD,
  NEO4J_USER,
} from "../constant/env";
("../constants/env");

type Neo4jAuth = {
  uri: string;
  username: string;
  password: string;
};

type Node = {
  label: string;
  properties?: Record<string, any>;
};

type Relationship = {
  startLabel: string;
  startId: string;
  endLabel: string;
  endId: string;
  relationship: string;
  properties?: Record<string, any>;
};

class Neo4jClient {
  private driver: Driver;

  constructor({ uri, username, password }: Neo4jAuth) {
    this.driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
  }

  async Node<T extends Node>({
    label,
    properties = {},
  }: T): Promise<Record<string, any>> {
    return this.transaction(async (tx: Transaction) => {
      const query = `
        MERGE (n:${label} {id: $properties.id}) 
        SET n += $properties
        RETURN n
      `;
      const result = await tx.run(query, { properties });
      if (result.records.length === 0) {
        throw new Error(
          `Node with properties ${JSON.stringify(properties)} already exists.`
        );
      }
      return result.records[0].get(0);
    });
  }

  async Relationship({
    startLabel,
    startId,
    endLabel,
    endId,
    relationship,
    properties = {},
  }: Relationship) {
    return this.transaction(async (tx: Transaction) => {
      const query = `
        MATCH (a:${startLabel} {id: $startId}), (b:${endLabel} {id: $endId})
        MERGE (a)-[r:${relationship}]->(b)
        SET r += $properties
        RETURN r
      `;
      const result = await tx.run(query, { startId, endId, properties });

      if (result.records.length === 0) {
        throw new Error(
          `Relationship between ${startLabel} with id ${startId} and ${endLabel} with id ${endId} already exists.`
        );
      }

      return result.records[0].get(0);
    });
  }

  async deleteNode({ label, properties = {} }: Node) {
    return this.transaction(async (tx: Transaction) => {
      const query = `MATCH (n:${label} {id: $properties.id}) DETACH DELETE n`;
      const result = await tx.run(query, { properties });
      if (result.summary.counters.updates().nodesDeleted === 0) {
        throw new Error(
          `Node with properties ${JSON.stringify(properties)} not found.`
        );
      }
    });
  }

  async deleteRelationship({
    startLabel,
    startId,
    endLabel,
    endId,
    relationship,
  }: Relationship) {
    return this.transaction(async (tx: Transaction) => {
      const query = `
        MATCH (a:${startLabel})-[r:${relationship}]->(b:${endLabel})
        WHERE a.id = $startId AND b.id = $endId
        DELETE r
      `;
      const result = await tx.run(query, { startId, endId });
      if (result.summary.counters.updates().relationshipsDeleted === 0) {
        throw new Error(
          `Relationship between ${startLabel} with id ${startId} and ${endLabel} with id ${endId} not found.`
        );
      }
    });
  }

  async getNodeById({
    label,
    id,
  }: {
    label: string;
    id: string;
  }): Promise<Record<string, any> | null> {
    return this.transaction(async (tx: Transaction) => {
      const query = `MATCH (n:${label} {id: $id}) RETURN n`;
      const result = await tx.run(query, { id });
      return result.records.length > 0 ? result.records[0].get("n") : null;
    });
  }

  async query(query: string, params: Record<string, any> = {}) {
    return this.transaction(async (tx: Transaction) => {
      const result = await tx.run(query, params);
      return result.records.map((record) => record.toObject());
    });
  }

  async transaction(callback: (tx: Transaction) => Promise<any>) {
    const session = this.driver.session({ database: NEO4J_DATABASE });
    const tx = session.beginTransaction();
    try {
      const result = await callback(tx);
      await tx.commit();
      return result;
    } catch (error) {
      await tx.rollback();
      throw error;
    } finally {
      await session.close();
    }
  }

  async getInstance() {
    return this.driver;
  }
}

const neo4jClient = new Neo4jClient({
  uri: NEO4J_URI,
  username: NEO4J_USER,
  password: NEO4J_PASSWORD,
});

export default neo4jClient;
