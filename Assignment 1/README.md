<h1 align="center">Task API</h1>

## Introduction

This is a simple REST API built with **Node.js** and **Express** for managing tasks. It supports full CRUD (Create, Read, Update, Delete) operations and includes interactive API documentation using Swagger UI.


## Prerequisites 
- Node.js (v18 or later)
- npm (comes with Node.js)

## Installation

```bash
git clone https://github.com/Salma-kabel/FlyRank-Ai.git
cd "FlyRank-Ai"
cd "Assignment 1"
npm install
```

## Running the Server

```bash
node server.js
```

## Endpoints Table

| Method | Endpoint      | Description                                    |
| ------ | ------------- | -----------------------------------------------|
| GET    | `/`           | Returns API information                        |
| GET    | `/health`     | Checks whether the server is running           |
| GET    | `/tasks`      | Returns all tasks/optional filtering and search|
| GET    | `/tasks/{id}` | Returns a task by ID                           |
| POST   | `/tasks`      | Creates a new task                             |
| PUT    | `/tasks/{id}` | Updates a task by ID                           |
| DELETE | `/tasks/{id}` | Deletes a task by ID                           |
| GET    | `/stats`      | Returns task statistics                        |
| POST   | `/reset`      | Restores the initial seed tasks                |


## Example Command

Command:

```bash
curl -i http://localhost:3000/tasks
```
Output:

```http
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 113
ETag: W/"71-IiGSg6Uv21rjz/h4zN7TAEWUa9k"
Date: Tue, 28 Jul 2026 11:59:55 GMT
Connection: keep-alive
Keep-Alive: timeout=5

[
    {"id":1,"title":"task1","done":true},
    {"id":2,"title":"task2","done":false},
    {"id":3,"title":"task3","done":true}
]
```

## Swagger UI

Open the following URL after starting the server to access the interactive Swagger UI:

```text
http://localhost:3000/docs
```
### Swagger UI Home
![Swagger UI](Images/Swagger.PNG)

### GET /tasks Response

The response returned after executing the **GET /tasks** endpoint in Swagger UI.

![GET /tasks Example](Images/Swagger-get-tasks.PNG)

## Optional Extras Added

- Filtering tasks:
  - `GET /tasks?done=true` returns completed tasks
  - `GET /tasks?done=false` returns incomplete tasks

- Searching tasks:
  - `GET /tasks?search=word` returns tasks whose titles contain the search term

- Statistics:
  - `GET /stats` returns the total number of tasks, completed tasks, and open tasks

- Reset:
  - `POST /reset` restores the original seed tasks

## What happens when the server is restarted

all the data we added is lost and tasks returns to be seedtasks, 
the reason is that we dont have database so each time the server restarts the data is lost

## AI vs Me
- the ai code is generally more optimized also, the way it generated the next id for a new task and the way it handled wrong input in the put '/tasks/id' endpoint was better than mine, i understand most of the version with a few commands search i will be able to explain it well.
- i told it to generate the value of done in the post endpoint randomly instead of false and in the post and put endpoints it returned only the updated or created task not the whole list.
- i forgot to specify whether the search is gonna be case sensitive or not so the ai decided it will be case insensitive.