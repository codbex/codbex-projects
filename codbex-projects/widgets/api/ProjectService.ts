import { TaskRepository as TaskDao } from "codbex-projects/gen/codbex-projects/dao/Deliverable/TaskRepository";

import { Controller, Get } from "sdk/http";
import { query } from "sdk/db";
import { response } from "sdk/http";

@Controller
class OrderService {

    private readonly taskDao;


    constructor() {
        this.taskDao = new TaskDao();
    }

    @Get("/projectData")
    public projectData() {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        let tasksProgressDone = this.taskDao.findAll({
            $filter: {
                equals: {
                    StatusType: 1
                }
            }
        });

        const tasksTodayLenght: number = !tasksProgressDone || tasksProgressDone.length === 0 ? 0 : tasksProgressDone.length;


        return {
            "TasksProgressDone": tasksTodayLenght
        };
    }


}