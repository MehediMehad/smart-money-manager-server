import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../utils/sendResponse";
import pick from "../../helpers/pick";
import { IncomeServices } from "./income.service";

const createIncome = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.userId;

    const result = await IncomeServices.createIncome(userId, req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Income created successfully",
        data: result,
    });
});

const getAllIncomes = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.userId;

    const filters = pick(req.query, [
        "searchTerm",
        "categoryId",
        "date",
        "month",
        "year",
    ]);

    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);

    const result = await IncomeServices.getAllIncomes(userId, filters, options);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Incomes fetched successfully",
        meta: result.meta,
        data: result.data,
    });
});

const getSingleIncome = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.userId;

    const result = await IncomeServices.getSingleIncome(userId, req.params.id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Income fetched successfully",
        data: result,
    });
});

const updateIncome = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.userId;

    const result = await IncomeServices.updateIncome(
        userId,
        req.params.id,
        req.body
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Income updated successfully",
        data: result,
    });
});

const deleteIncome = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.userId;

    await IncomeServices.deleteIncome(userId, req.params.id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Income deleted successfully",
        data: null,
    });
});

const getDashboardSummary2 = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.userId;
    const currentDate = new Date(); // ex: 2026-04-12T14:58:33.007Z
    const currentMonth = currentDate.getMonth() + 1; // ex: 3
    const currentYear = currentDate.getFullYear(); // ex: 2026
    const todayStr = currentDate.toISOString().split("T")[0]; // ex: "2026-03-16"

    console.log({ currentDate, currentMonth, currentYear, todayStr });


    const result = await IncomeServices.getDashboardSummary(
        userId,
        currentYear,
        currentMonth,
        todayStr
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Dashboard summary fetched successfully",
        data: result,
    });
});

const getDashboardSummary = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.userId;
    const filter = pick(req.query, ['date', 'month', 'year']);
    const { date, month, year } = filter as {
        date?: string;
        month?: string; // format: YYYY-MM
        year?: string;  // format: YYYY
    };

    const currentDate = new Date();

    let selectedDate = currentDate;
    let selectedMonth = currentDate.getMonth() + 1;
    let selectedYear = currentDate.getFullYear();
    let todayStr = currentDate.toISOString().split("T")[0];

    // If specific date is passed
    if (date) {
        selectedDate = new Date(date);
        selectedMonth = selectedDate.getMonth() + 1;
        selectedYear = selectedDate.getFullYear();
        todayStr = selectedDate.toISOString().split("T")[0];
    }

    // If month is passed like "2026-04"
    if (month) {
        const [y, m] = month.split("-").map(Number);
        selectedYear = y;
        selectedMonth = m;

        // If todayStr is the current date of this month, use the current date,
        // otherwise use the 1st day of that month
        if (
            currentDate.getFullYear() === selectedYear &&
            currentDate.getMonth() + 1 === selectedMonth
        ) {
            todayStr = currentDate.toISOString().split("T")[0];
        } else {
            todayStr = new Date(selectedYear, selectedMonth - 1, 1)
                .toISOString()
                .split("T")[0];
        }
    }

    // If year is passed like "2026"
    if (year) {
        selectedYear = Number(year);

        // If you give year only, you can keep the current month, or you can set Jan
        // I kept the current month if it is the same year, otherwise January
        if (selectedYear === currentDate.getFullYear()) {
            selectedMonth = currentDate.getMonth() + 1;
            todayStr = currentDate.toISOString().split("T")[0];
        } else {
            selectedMonth = 1;
            todayStr = new Date(selectedYear, 0, 1).toISOString().split("T")[0];
        }
    }

    const result = await IncomeServices.getDashboardSummary(
        userId,
        selectedYear,
        selectedMonth,
        todayStr
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Dashboard summary fetched successfully",
        data: result,
    });
});
export const IncomeControllers = {
    createIncome,
    getAllIncomes,
    getSingleIncome,
    updateIncome,
    deleteIncome,
    getDashboardSummary
};