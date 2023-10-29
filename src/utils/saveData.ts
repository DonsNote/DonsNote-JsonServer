import fs from "fs";
import path from "path";

export const saveData = (filename: string, data: any) => {
  const filePath = path.join(__dirname, '..', 'DB', filename);
  
  let currentData = [];
  if (fs.existsSync(filePath)) {
    const jsonString = fs.readFileSync(filePath, "utf-8");
    currentData = JSON.parse(jsonString);
  }

  const newId = currentData.length > 0 ? currentData[currentData.length - 1].id + 1 : 1;
  data.id = newId;

  currentData.push(data);
  fs.writeFileSync(filePath, JSON.stringify(currentData));

  return newId;
};
