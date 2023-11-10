import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { Report } from '../models/reportModel';
import { reportValidationRules, validateReport } from '../utils/ModelCheck/reportModelCheck';

const router = express.Router();
const reportFilePath = path.join(__dirname, '..', 'DB', 'report.json');

router.post("/", reportValidationRules, validateReport, async (req: Request, res: Response) => {
    try {
        const report = req.body;

        const reports: Report[] = JSON.parse(await fs.promises.readFile(reportFilePath, "utf8"));

        let newId = reports.length > 0 ? reports[reports.length - 1].id + 1 : 1;
        report.id = newId

        reports.push(report);

        await fs.promises.writeFile(reportFilePath, JSON.stringify(reports), "utf8");

        res.status(201).json({ message: "Post Report Success" });
    } catch (error) {
        res.status(500).json({ message: "Post Report Fail" });
    }
});

export default router;
