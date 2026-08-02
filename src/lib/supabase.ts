const VALID_SUPABASE_URL = "https://knjafkrildnehfbbmrqa.supabase.co";
const VALID_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuamFma3JpbGRuZWhmYmJtcnFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDQ4MzExNCwiZXhwIjoyMDkwMDU5MTE0fQ.xVrMuo4bTBbN7J71zUMdBcCCdmu1fmkburd_4V0sFrY";

class SupabaseRestHelper {
  private url: string;
  private key: string;

  constructor(url: string, key: string) {
    this.url = url;
    this.key = key;
  }

  from(table: string) {
    const url = this.url;
    const key = this.key;

    return {
      select: (fields: string = '*') => {
        const queryParams = [`select=${encodeURIComponent(fields)}`];
        
        const builder = {
          eq: (column: string, val: any) => {
            queryParams.push(`${encodeURIComponent(column)}=eq.${encodeURIComponent(val)}`);
            return builder;
          },
          gte: (column: string, val: any) => {
            queryParams.push(`${encodeURIComponent(column)}=gte.${encodeURIComponent(val)}`);
            return builder;
          },
          lte: (column: string, val: any) => {
            queryParams.push(`${encodeURIComponent(column)}=lte.${encodeURIComponent(val)}`);
            return builder;
          },
          gt: (column: string, val: any) => {
            queryParams.push(`${encodeURIComponent(column)}=gt.${encodeURIComponent(val)}`);
            return builder;
          },
          lt: (column: string, val: any) => {
            queryParams.push(`${encodeURIComponent(column)}=lt.${encodeURIComponent(val)}`);
            return builder;
          },
          in: (column: string, values: any[]) => {
            const encodedValues = values.map(v => String(v)).join(',');
            queryParams.push(`${encodeURIComponent(column)}=in.(${encodedValues})`);
            return builder;
          },
          offset: (count: number) => {
            queryParams.push(`offset=${count}`);
            return builder;
          },
          order: (column: string, { ascending = true }: { ascending?: boolean } = {}) => {
            queryParams.push(`order=${encodeURIComponent(column)}.${ascending ? 'asc' : 'desc'}`);
            return builder;
          },
          limit: (count: number) => {
            queryParams.push(`limit=${count}`);
            return builder;
          },
          single: async () => {
            try {
              const res = await fetch(`${url}/rest/v1/${table}?${queryParams.join('&')}`, {
                headers: {
                  'apikey': key,
                  'Authorization': `Bearer ${key}`,
                  'Accept': 'application/vnd.pgrst.object+json'
                },
                cache: 'no-store'
              });
              if (!res.ok) {
                const errJson = await res.json().catch(() => ({ message: res.statusText }));
                return { data: null, error: { message: errJson.message || errJson.error || 'Query failed' } };
              }
              const data = await res.json();
              return { data, error: null };
            } catch (err: any) {
              return { data: null, error: { message: err.message || 'Fetch failed' } };
            }
          },
          maybeSingle: async () => {
            try {
              const res = await fetch(`${url}/rest/v1/${table}?${queryParams.join('&')}`, {
                headers: {
                  'apikey': key,
                  'Authorization': `Bearer ${key}`
                },
                cache: 'no-store'
              });
              if (!res.ok) {
                const errJson = await res.json().catch(() => ({ message: res.statusText }));
                return { data: null, error: { message: errJson.message || errJson.error || 'Query failed' } };
              }
              const data = await res.json();
              return { data: Array.isArray(data) ? (data[0] || null) : data, error: null };
            } catch (err: any) {
              return { data: null, error: { message: err.message || 'Fetch failed' } };
            }
          },
          then: async (resolve: any) => {
            try {
              const res = await fetch(`${url}/rest/v1/${table}?${queryParams.join('&')}`, {
                headers: {
                  'apikey': key,
                  'Authorization': `Bearer ${key}`
                },
                cache: 'no-store'
              });
              if (!res.ok) {
                const errJson = await res.json().catch(() => ({ message: res.statusText }));
                return resolve({ data: null, error: { message: errJson.message || errJson.error || 'Query failed' } });
              }
              const data = await res.json();
              return resolve({ data, error: null });
            } catch (err: any) {
              return resolve({ data: null, error: { message: err.message || 'Fetch failed' } });
            }
          }
        };
        return builder;
      },
      insert: (record: any) => {
        return {
          select: (fields: string = '*') => ({
            single: async () => {
              try {
                const res = await fetch(`${url}/rest/v1/${table}`, {
                  method: 'POST',
                  headers: {
                    'apikey': key,
                    'Authorization': `Bearer ${key}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation, single=true'
                  },
                  body: JSON.stringify(record)
                });
                if (!res.ok) {
                  const errJson = await res.json().catch(() => ({ message: res.statusText }));
                  return { data: null, error: { message: errJson.message || errJson.error || 'Insert failed' } };
                }
                const data = await res.json();
                return { data, error: null };
              } catch (err: any) {
                return { data: null, error: { message: err.message || 'Insert failed' } };
              }
            }
          }),
          then: async (resolve: any) => {
            try {
              const res = await fetch(`${url}/rest/v1/${table}`, {
                method: 'POST',
                headers: {
                  'apikey': key,
                  'Authorization': `Bearer ${key}`,
                  'Content-Type': 'application/json',
                  'Prefer': 'return=representation'
                },
                body: JSON.stringify(record)
              });
              if (!res.ok) {
                const errJson = await res.json().catch(() => ({ message: res.statusText }));
                return resolve({ data: null, error: { message: errJson.message || errJson.error || 'Insert failed' } });
              }
              const data = await res.json();
              return resolve({ data, error: null });
            } catch (err: any) {
              return resolve({ data: null, error: { message: err.message || 'Insert failed' } });
            }
          }
        };
      },
      update: (updates: any) => {
        return {
          eq: (column: string, val: any) => ({
            select: (fields: string = '*') => ({
              single: async () => {
                try {
                  const res = await fetch(`${url}/rest/v1/${table}?${encodeURIComponent(column)}=eq.${encodeURIComponent(val)}`, {
                    method: 'PATCH',
                    headers: {
                      'apikey': key,
                      'Authorization': `Bearer ${key}`,
                      'Content-Type': 'application/json',
                      'Prefer': 'return=representation, single=true'
                    },
                    body: JSON.stringify(updates)
                  });
                  if (!res.ok) {
                    const errJson = await res.json().catch(() => ({ message: res.statusText }));
                    return { data: null, error: { message: errJson.message || errJson.error || 'Update failed' } };
                  }
                  const data = await res.json();
                  return { data, error: null };
                } catch (err: any) {
                  return { data: null, error: { message: err.message || 'Update failed' } };
                }
              }
            }),
            then: async (resolve: any) => {
              try {
                const res = await fetch(`${url}/rest/v1/${table}?${encodeURIComponent(column)}=eq.${encodeURIComponent(val)}`, {
                  method: 'PATCH',
                  headers: {
                    'apikey': key,
                    'Authorization': `Bearer ${key}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(updates)
                });
                if (!res.ok) {
                  const errJson = await res.json().catch(() => ({ message: res.statusText }));
                  return resolve({ data: null, error: { message: errJson.message || errJson.error || 'Update failed' } });
                }
                return resolve({ data: true, error: null });
              } catch (err: any) {
                return resolve({ data: null, error: { message: err.message || 'Update failed' } });
              }
            }
          })
        };
      },
      delete: () => ({
        eq: (column: string, val: any) => ({
          then: async (resolve: any) => {
            try {
              const res = await fetch(`${url}/rest/v1/${table}?${encodeURIComponent(column)}=eq.${encodeURIComponent(val)}`, {
                method: 'DELETE',
                headers: {
                  'apikey': key,
                  'Authorization': `Bearer ${key}`
                }
              });
              if (!res.ok) {
                const errJson = await res.json().catch(() => ({ message: res.statusText }));
                return resolve({ data: null, error: { message: errJson.message || errJson.error || 'Delete failed' } });
              }
              return resolve({ data: true, error: null });
            } catch (err: any) {
              return resolve({ data: null, error: { message: err.message || 'Delete failed' } });
            }
          }
        })
      })
    };
  }
}

export async function uploadFileToSupabase(file: File | Blob, filePath: string): Promise<string> {
  const uploadUrl = `${VALID_SUPABASE_URL}/storage/v1/object/airbnb-proofs/${filePath}`;
  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'apikey': VALID_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${VALID_SERVICE_ROLE_KEY}`,
      'Content-Type': (file as File).type || 'image/jpeg',
      'x-upsert': 'true'
    },
    body: file
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error || json.message || 'Storage upload failed');
  }

  return `${VALID_SUPABASE_URL}/storage/v1/object/public/airbnb-proofs/${filePath}`;
}

const storageHelper = {
  from: (bucket: string) => ({
    upload: async (filePath: string, file: File | Blob) => {
      try {
        const publicUrl = await uploadFileToSupabase(file, filePath);
        return { data: { path: filePath, publicUrl }, error: null };
      } catch (err: any) {
        return { data: null, error: { message: err.message || 'Upload failed' } };
      }
    }
  })
};

export const supabaseAdmin = new SupabaseRestHelper(VALID_SUPABASE_URL, VALID_SERVICE_ROLE_KEY) as any;
export const supabase = new SupabaseRestHelper(VALID_SUPABASE_URL, VALID_SERVICE_ROLE_KEY) as any;

supabaseAdmin.storage = storageHelper;
supabase.storage = storageHelper;
