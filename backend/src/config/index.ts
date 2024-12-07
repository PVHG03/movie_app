import connectMongoDB from "./mongo";
import connectNeo4j from "./neo4j";

const connectDB = async () => {
  let neo4jDriver;
  try {
    await connectMongoDB();
    neo4jDriver = await connectNeo4j();

    return {mongoReady: true, neo4jReady: true, neo4jDriver};
  } catch (error:any) {
    console.error("Error connecting to databases:", error.message);
    process.exit(1);
  }
};

export default connectDB;