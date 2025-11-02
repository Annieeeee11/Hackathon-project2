export interface PathwayConfig {
  apiUrl: string;
  apiKey?: string;
}

export interface PathwayQuery {
  query: string;
  context?: Record<string, any>;
  parameters?: Record<string, any>;
}

export interface PathwayResponse {
  result: any;
  metadata?: {
    processingTime?: number;
    timestamp?: string;
  };
}

export interface PathwayDataSource {
  name: string;
  type: 'file' | 'stream' | 'database';
  config: Record<string, any>;
}

class PathwayService {
  private config: PathwayConfig;

  constructor(config?: Partial<PathwayConfig>) {
    this.config = {
      apiUrl: process.env.PATHWAY_API_URL || 'http://localhost:8080',
      apiKey: process.env.PATHWAY_API_KEY,
      ...config,
    };
  }

  async query(data: PathwayQuery): Promise<PathwayResponse> {
    const url = `${this.config.apiUrl}/query`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Pathway API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      return {
        result: result.data || result,
        metadata: {
          processingTime: result.processingTime,
          timestamp: result.timestamp || new Date().toISOString(),
        },
      };
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(
          'Failed to connect to Pathway service. Ensure Pathway is running and PATHWAY_API_URL is configured correctly.'
        );
      }
      throw error;
    }
  }

  async subscribe(
    source: PathwayDataSource,
    onData: (data: any) => void,
    onError?: (error: Error) => void
  ): Promise<() => void> {
    const url = `${this.config.apiUrl}/subscribe`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }
    let isActive = true;

    const poll = async () => {
      while (isActive) {
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(source),
          });

          if (response.ok) {
            const data = await response.json();
            onData(data);
          }
        } catch (error) {
          if (onError && error instanceof Error) {
            onError(error);
          }
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    };

    poll();

    return () => {
      isActive = false;
    };
  }

  async processData(input: any, pipeline?: string): Promise<any> {
    const url = pipeline 
      ? `${this.config.apiUrl}/pipeline/${pipeline}/process`
      : `${this.config.apiUrl}/process`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ input }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pathway processing error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  async healthCheck(): Promise<boolean> {
    try {
      const url = `${this.config.apiUrl}/health`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.config.apiKey
          ? { Authorization: `Bearer ${this.config.apiKey}` }
          : {},
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}

let pathwayServiceInstance: PathwayService | null = null;

export function getPathwayService(config?: Partial<PathwayConfig>): PathwayService {
  if (!pathwayServiceInstance || config) {
    pathwayServiceInstance = new PathwayService(config);
  }
  return pathwayServiceInstance;
}
export { PathwayService };

