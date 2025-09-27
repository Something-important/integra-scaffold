// Supabase utility functions for direct HTTPS API calls
// No additional dependencies required - uses native fetch()

interface SupabaseConfig {
  url: string;
  apiKey: string;
}

interface SupabaseResponse<T = any> {
  data?: T;
  error?: {
    message: string;
    details?: string;
    hint?: string;
    code?: string;
  };
  count?: number;
}

interface QueryOptions {
  select?: string;
  where?: Record<string, any>;
  order?: string;
  limit?: number;
  offset?: number;
  count?: boolean;
}

class SupabaseClient {
  private config: SupabaseConfig;

  constructor() {
    this.config = {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      apiKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    };

    // Temporary debug - remove after testing
    console.log('Using Service Key:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    console.log('API Key starts with:', this.config.apiKey.substring(0, 10));

    if (!this.config.url || !this.config.apiKey) {
      throw new Error('Supabase URL and API key must be provided in environment variables');
    }
  }

  private getHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'apikey': this.config.apiKey,
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Prefer': 'return=representation',
      ...additionalHeaders
    };
  }

  private buildQuery(options: QueryOptions = {}): string {
    const params = new URLSearchParams();

    if (options.select) {
      params.append('select', options.select);
    }

    if (options.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, `eq.${value}`);
        }
      });
    }

    if (options.order) {
      params.append('order', options.order);
    }

    if (options.limit) {
      params.append('limit', options.limit.toString());
    }

    if (options.offset) {
      params.append('offset', options.offset.toString());
    }

    // Note: count is handled as a header preference, not a URL parameter

    return params.toString();
  }

  private async makeRequest<T>(
    method: string,
    table: string,
    data?: any,
    options?: QueryOptions,
    additionalHeaders?: Record<string, string>
  ): Promise<SupabaseResponse<T>> {
    try {
      const query = options ? this.buildQuery(options) : '';
      const url = `${this.config.url}/rest/v1/${table}${query ? `?${query}` : ''}`;

      const headers = this.getHeaders(additionalHeaders);

      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      const responseText = await response.text();

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { message: responseText || `HTTP ${response.status}` };
        }

        return {
          error: {
            message: errorData.message || 'Unknown error',
            details: errorData.details,
            hint: errorData.hint,
            code: errorData.code || response.status.toString()
          }
        };
      }

      let responseData;
      try {
        responseData = responseText ? JSON.parse(responseText) : null;
      } catch {
        responseData = responseText;
      }

      const result: SupabaseResponse<T> = {
        data: responseData
      };

      // Add count if present in headers
      const countHeader = response.headers.get('content-range');
      if (countHeader) {
        const countMatch = countHeader.match(/\/(\d+)$/);
        if (countMatch) {
          result.count = parseInt(countMatch[1]);
        }
      }

      return result;
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Network error',
          details: 'Failed to connect to Supabase'
        }
      };
    }
  }

  // SELECT operation
  async select<T>(table: string, options?: QueryOptions): Promise<SupabaseResponse<T[]>> {
    return this.makeRequest<T[]>('GET', table, undefined, options,
      options?.count ? { 'Prefer': 'count=exact' } : undefined
    );
  }

  // INSERT operation
  async insert<T>(table: string, data: any | any[]): Promise<SupabaseResponse<T>> {
    return this.makeRequest<T>('POST', table, data);
  }

  // UPDATE operation
  async update<T>(table: string, data: any, options: QueryOptions): Promise<SupabaseResponse<T>> {
    if (!options.where) {
      throw new Error('WHERE clause is required for UPDATE operations');
    }
    return this.makeRequest<T>('PATCH', table, data, options);
  }

  // DELETE operation
  async delete<T>(table: string, options: QueryOptions): Promise<SupabaseResponse<T>> {
    if (!options.where) {
      throw new Error('WHERE clause is required for DELETE operations');
    }
    return this.makeRequest<T>('DELETE', table, undefined, options);
  }

  // UPSERT operation (INSERT with ON CONFLICT)
  async upsert<T>(table: string, data: any | any[], conflictColumns?: string[]): Promise<SupabaseResponse<T>> {
    const headers: Record<string, string> = {};
    if (conflictColumns && conflictColumns.length > 0) {
      headers['Prefer'] = `resolution=merge-duplicates,return=representation`;
    }
    return this.makeRequest<T>('POST', table, data, undefined, headers);
  }

  // RPC (Remote Procedure Call) for stored procedures
  async rpc<T>(functionName: string, params?: Record<string, any>): Promise<SupabaseResponse<T>> {
    try {
      const url = `${this.config.url}/rest/v1/rpc/${functionName}`;
      const headers = this.getHeaders();

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: params ? JSON.stringify(params) : undefined,
      });

      const responseText = await response.text();

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { message: responseText || `HTTP ${response.status}` };
        }

        return {
          error: {
            message: errorData.message || 'Unknown error',
            details: errorData.details,
            hint: errorData.hint,
            code: errorData.code || response.status.toString()
          }
        };
      }

      let responseData;
      try {
        responseData = responseText ? JSON.parse(responseText) : null;
      } catch {
        responseData = responseText;
      }

      return { data: responseData };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Network error',
          details: 'Failed to connect to Supabase'
        }
      };
    }
  }
}

// Create a singleton instance
const supabase = new SupabaseClient();

export default supabase;
export type { SupabaseResponse, QueryOptions };