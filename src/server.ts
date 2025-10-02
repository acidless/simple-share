import FileModel from "./models/FileModel.js";

const model = new FileModel();
model.create({originalName:"example.txt", size: 1024, mimeType: "text/plain", path: "./example.txt"});