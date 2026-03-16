# Architecture Decisions

### 1. How would you scale this to 100k users?
To handle 100k users, the architecture would need several enhancements:
- **Load Balancing**: Deploy multiple instances of the backend API behind a load balancer (like AWS ALB or Nginx) to distribute traffic evenly.
- **Database Migration**: Move away from SQLite to a fully managed relational database like PostgreSQL or a NoSQL solution like MongoDB depending on querying needs. Read replicas could handle heavy read volumes.
- **Asynchronous Processing**: Introduce a message queue (e.g., RabbitMQ, Redis Pub/Sub, or AWS SQS) for the LLM analysis. The API would return an immediate "processing" status, and a background worker would call the LLM and update the database, preventing timeout issues and keeping the API snappy.

### 2. How would you reduce LLM cost?
- **Caching**: Avoid re-analyzing identical journal entries by caching the LLM results.
- **Smaller Models**: Use cheaper and faster models (like Gemini-1.5-Flash or Claude Haiku) for simple keyword and emotion extraction instead of using top-tier expensive models.
- **Batch Processing**: Instead of analyzing every single entry in real-time, we could summarize a user's entire week in one prompt to generate insights if individual entries don't strictly require immediate analysis.

### 3. How would you cache repeated analysis?
If a user submits the exact same text again, we should not call the LLM again.
- **In-Memory Cache or Redis**: Store a hash of the input text as the key and the LLM JSON response as the value in Redis.
- **Database Lookup**: Before calling the LLM, the backend hashes the incoming text and queries a `Cache` table or Redis. If a match is found, return the cached analysis immediately.

### 4. How would you protect sensitive journal data?
User journals are highly personal. Security must be a priority:
- **Encryption at Rest**: Ensure the database is encrypted on the disk (e.g., using AWS KMS for RDS).
- **Encryption in Transit**: Force HTTPS/TLS for all API communication.
- **Authentication & Authorization**: Implement strict JWT-based or session-based authentication to ensure users can only ever access their own journals.
- **Anonymization for LLMs**: Sanitize the journal text before sending it to the LLM. Remove named entities (like names of people, phone numbers, or addresses) completely so third-party AI providers never receive PII (Personally Identifiable Information).
