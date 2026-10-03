# Similar Items are found in Qdrant, a derived index beside MongoDB

Knowledge finds Similar Items, the items closest in meaning to a given one whether or not a Link joins them, for the Auditor first, an external agent over MCP next and Intentra before recording after that. It belongs to Knowledge, not to the Auditor, since finding what is alike is a question about the knowledge. The vectors live in Qdrant, while MongoDB stays the only source of truth: Qdrant holds a vector per Knowledge Item with its Project and key, is filled from MongoDB and can be rebuilt from it whole at any time, so writes need no transaction across the two and a vector left behind by a deleted item is dropped when the item is read from MongoDB. The vectors come from an embedding model through OpenRouter on the Workspace's Provider Key; without one, a Workspace has no Similar Items until a key is added and the index is filled after the fact.

## Considered Options

- **MongoDB `$vectorSearch`.** Rejected for now: self-managed it needs MongoDB 8.2 and a separate `mongot` process (we run `mongo:7`, and servers without AVX run 4.4), and `mongot` outside Atlas is new.
- **Vectors stored in MongoDB, compared in code.** Considered: enough for a Project of a few thousand items and no new service, but the team chose a real vector store over a brute-force scan.
- **pgvector or another store.** Rejected: a second relational database to keep in step for nothing Qdrant lacks.

## Consequences

- Docker Compose gains a Qdrant service.
- Knowledge needs the Provider Key, which Agents keep, while Agents already depend on Knowledge. So Knowledge only declares what it needs, reading meaning for a Workspace, and the Workspace context wires it to the Agents' key at its root, as it does for cleanup: Knowledge never reaches into Agents and the key stays where it is.
- Nothing is indexed when knowledge is written: every search first brings the Project's index in step (what changed is read anew, what left is dropped), so a write never waits for the model and a Workspace that adds a key later is indexed on its first search.
- Without `QDRANT_URL` the index lives in the server's memory: enough for tests and a single dev run, rebuilt after a restart.
