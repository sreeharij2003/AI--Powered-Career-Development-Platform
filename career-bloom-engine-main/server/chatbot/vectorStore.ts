import * as crypto from 'crypto';
import { Document } from 'langchain/document';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';

/**
 * Custom embedding class that uses a simple hash-based approach
 * instead of external API calls to OpenAI
 */
class HashBasedEmbeddings {
  private dimensions: number;
  
  constructor(dimensions: number = 1536) { // Same dimensions as text-embedding-ada-002
    this.dimensions = dimensions;
  }
  
  /**
   * Generate embeddings for a list of texts
   */
  async embedDocuments(texts: string[]): Promise<number[][]> {
    return texts.map(text => this.generateEmbedding(text));
  }
  
  /**
   * Generate embeddings for a single query
   */
  async embedQuery(text: string): Promise<number[]> {
    return this.generateEmbedding(text);
  }
  
  /**
   * Generate a deterministic embedding based on text content
   */
  private generateEmbedding(text: string): number[] {
    // Normalize the text
    const normalizedText = text
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
    
    // Get a deterministic hash of the text
    const hash = crypto.createHash('sha256').update(normalizedText).digest('hex');
    
    // Convert the hash to a high-dimensional embedding
    const embedding: number[] = [];
    
    for (let i = 0; i < this.dimensions; i++) {
      const charIndex = (i * 2) % hash.length;
      const hexValue = hash.substring(charIndex, charIndex + 2);
      const value = parseInt(hexValue, 16);
      // Normalize to -1 to 1 range
      embedding.push((value / 255) * 2 - 1);
    }
    
    // Normalize to unit length (L2 norm)
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / magnitude);
  }
}

class VectorStore {
  private embeddings: HashBasedEmbeddings;
  private vectorStore: MemoryVectorStore | null = null;
  private isInitialized = false;

  constructor() {
    // Initialize our hash-based embeddings (no API key needed)
    this.embeddings = new HashBasedEmbeddings();
  }

  async initialize() {
    try {
      if (!this.isInitialized) {
        // Create a new in-memory vector store
        this.vectorStore = new MemoryVectorStore(this.embeddings);
        this.isInitialized = true;
      }
      
      console.log('Vector store initialized successfully');
    } catch (error) {
      console.error('Error initializing vector store:', error);
      throw error;
    }
  }

  /**
   * Converts a job object to a LangChain Document
   */
  private jobToDocument(job: any): Document {
    // Combine relevant job information into a single text
    const text = `
      Job Title: ${job.title || ''}
      Company: ${job.company || ''}
      Location: ${job.location || ''}
      Remote: ${job.remote ? 'Yes' : 'No'}
      Salary: ${job.salary || 'Not specified'}
      Job Type: ${job.type || ''}
      Skills: ${job.skills?.join(', ') || ''}
      Description: ${job.description || ''}
      Posted Date: ${job.posted_date ? new Date(job.posted_date).toISOString().split('T')[0] : 'Not specified'}
    `;

    // Create a LangChain Document with metadata
    return new Document({
      pageContent: text,
      metadata: {
        id: job._id?.toString() || job.id?.toString() || '',
        title: job.title || '',
        company: job.company || '',
        location: job.location || '',
        remote: job.remote || false,
        salary: job.salary || '',
        type: job.type || '',
        skills: job.skills || [],
        postedDate: job.posted_date || new Date(),
        isActive: job.is_active || true
      }
    });
  }

  /**
   * Adds job documents to the vector store
   */
  async addDocuments(jobs: any[]) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Convert jobs to LangChain documents
      const documents = jobs.map(job => this.jobToDocument(job));
      
      // Split documents into chunks if they're too large
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      
      const splitDocs = await textSplitter.splitDocuments(documents);
      
      // Add documents to the vector store
      if (this.vectorStore) {
        await this.vectorStore.addDocuments(splitDocs);
      }
      
      console.log(`Successfully added ${jobs.length} documents to vector store`);
    } catch (error) {
      console.error('Error adding documents:', error);
      throw error;
    }
  }

  /**
   * Queries the vector store for relevant documents
   */
  async queryDocuments(query: string, k: number = 5): Promise<any[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.vectorStore) {
      console.log('Vector store not initialized or empty');
      return [];
    }

    try {
      // Search for similar documents in the vector store
      const results = await this.vectorStore.similaritySearch(query, k);
      
      // Extract job metadata from the retrieved documents
      const jobs = results.map((doc: Document) => {
        const metadata = doc.metadata;
        return {
          id: metadata.id,
          title: metadata.title,
          company: metadata.company,
          location: metadata.location,
          remote: metadata.remote,
          salary: metadata.salary,
          type: metadata.type,
          skills: metadata.skills,
          description: doc.pageContent.split('Description:')[1]?.trim() || "",
          posted_date: new Date(metadata.postedDate),
          is_active: metadata.isActive
        };
      });

      return jobs;
    } catch (error) {
      console.error('Error querying documents:', error);
      throw error;
    }
  }

  /**
   * Clears all documents from the vector store
   */
  async clearVectorStore() {
    try {
      // Create a new vector store (effectively clearing the old one)
      this.vectorStore = new MemoryVectorStore(this.embeddings);
      console.log('Vector store cleared successfully');
      return true;
    } catch (error) {
      console.error('Error clearing vector store:', error);
      throw error;
    }
  }
}

export default VectorStore; 