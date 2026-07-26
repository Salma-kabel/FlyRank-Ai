const express = require('express');
const app = express();
app.use(express.json());
const port = 3000;
const tasks = [
    {id: 1, title: 'task1', done: true},
    {id: 2, title: 'task2', done: false},
    {id : 3, title: 'task3', done: true}
]

app.get('/', (req, res) => {
    res.json({ "name": "Task API", "version": "1.0", "endpoints": ["/tasks"] });
});

app.get('/health', (req, res) => {
    res.json({ "status": "ok" });
});

app.get('/tasks', (req, res) => {
    return res.json(tasks);
});

app.get('/tasks/:id', (req, res) => {
    task = tasks.find(t => t.id == req.params.id);
    if (task) {
        return res.json(task);
    }
    return res.status(404).json({
        "error": `Task ${req.params.id} not found`
    });
});

app.post('/tasks', (req, res) => {
    const title = req.body.title;
    console.log(req.body);
    if (!title) {
        return res.status(400).json({"error": "title is missing"});
    }
    else if (title.trim() === "") {
        return res.status(400).json({"error": "title is empty"});
    }
    const id = tasks.length + 1;
    const done = false;
    const task = {id, title, done};
    tasks.push(task);
    return res.status(201).json(task);
});



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});