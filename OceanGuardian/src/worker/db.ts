/**
 * Turso HTTP API client for Cloudflare Workers
 *
 * Uses the native `fetch` API directly instead of @libsql/client
 * to avoid the Node.js https.request polyfill issue in workerd.
 *
 * API Reference: https://docs.turso.tech/sdk/http/reference
 */

interface TursoRow {
  [key: string]: string | number | null;
}

interface TursoResult {
  columns: string[];
  rows: TursoRow[];
  rowsAffected: number;
  lastInsertRowid: bigint | number;
}

interface TursoClient {
  execute(params: { sql: string; args?: (string | number | null)[] }): Promise<TursoResult>;
  executeMultiple(sql: string): Promise<void>;
}

export function getTursoClient(env: Env): TursoClient {
  const baseUrl = env.TURSO_DB_URL.replace("libsql://", "https://");
  const authToken = env.TURSO_DB_AUTH_TOKEN;

  return {
    async execute({ sql, args = [] }: { sql: string; args?: (string | number | null)[] }): Promise<TursoResult> {
      const response = await fetch(`${baseUrl}/v2/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requests: [
            { type: "execute", stmt: { sql, args: args.map(valueToArg) } },
            { type: "close" },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Turso API error (${response.status}): ${errorText}`);
      }

      const data = await response.json() as any;
      const result = data.results?.[0];

      if (result?.type === "error") {
        throw new Error(`Turso query error: ${result.error?.message || JSON.stringify(result.error)}`);
      }

      const execResult = result?.response?.result;
      if (!execResult) {
        return { columns: [], rows: [], rowsAffected: 0, lastInsertRowid: 0 };
      }

      const columns = execResult.cols?.map((c: any) => c.name) || [];
      const rows = (execResult.rows || []).map((row: any[]) => {
        const obj: TursoRow = {};
        columns.forEach((col: string, i: number) => {
          const cell = row[i];
          obj[col] = cell?.type === "null" ? null : cell?.value ?? null;
        });
        return obj;
      });

      return {
        columns,
        rows,
        rowsAffected: execResult.affected_row_count || 0,
        lastInsertRowid: execResult.last_insert_rowid ? BigInt(execResult.last_insert_rowid) : BigInt(0),
      };
    },

    async executeMultiple(sql: string): Promise<void> {
      // Split on semicolons, handling parenthesized blocks
      const statements: string[] = [];
      let current = "";
      let parenDepth = 0;

      for (const line of sql.split("\n")) {
        const trimmed = line.trim();
        if (trimmed.startsWith("--") || trimmed === "") continue;

        current += line + "\n";
        for (const char of line) {
          if (char === "(") parenDepth++;
          if (char === ")") parenDepth--;
        }

        if (trimmed.endsWith(";") && parenDepth === 0) {
          statements.push(current.trim());
          current = "";
        }
      }
      if (current.trim()) statements.push(current.trim());

      const requests = statements.flatMap((stmt) => [
        { type: "execute" as const, stmt: { sql: stmt } },
      ]);
      requests.push({ type: "close" as any, stmt: undefined as any });

      const response = await fetch(`${baseUrl}/v2/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requests }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Turso batch error (${response.status}): ${errorText}`);
      }
    },
  };
}

function valueToArg(value: string | number | null | bigint): any {
  if (value === null || value === undefined) {
    return { type: "null", value: null };
  }
  if (typeof value === "number") {
    if (Number.isInteger(value)) {
      return { type: "integer", value: String(value) };
    }
    return { type: "float", value };
  }
  if (typeof value === "bigint") {
    return { type: "integer", value: String(value) };
  }
  return { type: "text", value: String(value) };
}
