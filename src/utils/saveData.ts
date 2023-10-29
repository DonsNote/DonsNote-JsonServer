import fs from "fs";

export const saveData = (filename: string, data: any) => {
  const jsonString = fs.readFileSync(filename, "utf-8");
  let currentData = JSON.parse(jsonString);

  const newId = currentData && currentData.length > 0 ? currentData[currentData.length - 1].id + 1 : 1;
  data.id = newId;

  if (!currentData) {
    currentData = [];
  }
  currentData.push(data);
  fs.writeFileSync(filename, JSON.stringify(currentData));

  return newId;
};
