import chromadb
import time
import os
from chromadb.config import Settings

# Create the data directory if it doesn't exist
os.makedirs("./chromadb_data", exist_ok=True)

# Initialize ChromaDB with persistent storage
chroma_client = chromadb.PersistentClient(path="./chromadb_data")

print("ChromaDB server is running...")
print("Press Ctrl+C to stop the server")

try:
    # Keep the script running
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("Shutting down ChromaDB server...") 