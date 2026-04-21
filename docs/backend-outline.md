## Vital Horizon Backend (Future Step)

This project currently uses local mock state in the app.  
When backend work starts, keep it simple and map endpoints to these resources:

- `User`
- `Surgery`
- `Tasks`
- `HealthStatus`

### Suggested REST Routes

- `GET /users`
- `POST /users`
- `GET /surgery/:userId`
- `POST /surgery`
- `GET /tasks/:userId?date=YYYY-MM-DD`
- `POST /tasks`
- `PATCH /tasks/:taskId`
- `GET /health-status/:userId`
- `PATCH /health-status/:id`

### PostgreSQL Tables

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE surgery (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  surgery_date DATE NOT NULL
);

CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  date DATE NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE
);

CREATE TABLE health_status (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  liver_level INTEGER NOT NULL,
  health_score INTEGER NOT NULL
);
```
