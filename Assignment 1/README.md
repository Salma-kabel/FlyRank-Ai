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
npm start
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
- i told it to generate the value of done in the post endpoint randomly instead of false and in the post and put endpoints it returned the whole list not only the updated task.
- i forgot to specify whether the search is gonna be case sensitive or not and i didnt explain the put validation properly and forgot to tell it to generate the package.json file.

### Prompt Used
i want to build a backend core api and i want you to give me the code for 4 files
first :( a server.js file which is where all the backend code will be written i i want to use nodejs and express to build it and to use swagger ui for the users to be able to test it 
instead of a database we will use a seedtasks list which contains 3 tasks for each task there is id(number), title(string), done(true or false)
create 3 tasks in seedtasks based on what i gave you and then create another list called tasks (that is initially a copy from seedtask) which we will be working on in the end points
Use express.json() for parsing JSON request bodies.
the endpoints are:
1- get '/' where it gives in json this information about the api ({ "name": "Task API", "version": "1.0", "endpoints": ["/tasks"] })
2- get '/health' where it shows the status of the server and that its alive ( { "status": "ok" } )
3- get '/tasks' where i want it to have two optional query parameters (done and search)
if search was given perform a case-insensitive substring search on the task title using the search query parameter.
if done was given it filter the tasks and get the tasks that is done or the not done based on the value of done and if done value wasnt true or false it will return 400 and tell that the value of done is wrong
if non of them it will give the tasks list as it is
4- get '/tasks/:id' where it return the task which id is entered or 404 and tell the user that the task with this id wasnt found
5- post '/tasks' where the user has to provide a body containing a 'title' and if not it will return 400 if the body is empty or title is empty or title is not string
if a title was found it will generate the new task id as one greater than the current highest id in the tasks array and will set done to false,
If the array is empty, start with id = 1.
when all succeeds it will add this task to the list tasks and return a status 201 and the created task
6-put '/tasks/:id' it will change some information about a task whether done or title
if the task with the id provided wasnt found it will return a 404 and a message to the user
if the body is empty or not from the valid input or title is empty or not a string or done is not boolean it will return 400 and a message to the user
otherwise it will change the value of the property chosen by the user to the one that the user gave us
if all is well return 200 status and the updated task
7- delete '/tasks/:id' it will delete the task which id is entered if the task with this id is not found it will return 404 and a message
otherwise it will return 204 and an empty body
8- get '/stats' where it will return a dict containing(
total: total number of taskes,
done : number of tasks which done is true,
open: no of tasks which done is false)
9- post '/reset' where it will reset the tasks array to the seedtasks and return it )
second : an openai.js file that will be used by the swagger in the first file it will contain all the endpoints and work so that the user can test the api when they enter the path of '/docs'
third : a readme.md file about the api put what usually most developers put introduction, installation, table of endpoints and what they do, example command and so on
fourth: a package.json file containing everything needed to run the api

### Differences
- now done is is set to false not a random value (as per the requirements)
- put/post return a single task not the whole list