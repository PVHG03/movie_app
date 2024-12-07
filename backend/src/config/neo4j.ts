import neo4jClient from '../utils/Neo4j';

const connectNeo4j = async () => {
  try {
    const driver = neo4jClient.getInstance();
    console.log("Neo4j connected");
    return driver;
  } catch (error : any) {
    console.error("Neo4j connection error:", error.message);
    process.exit(1);
  }
}

export default connectNeo4j;