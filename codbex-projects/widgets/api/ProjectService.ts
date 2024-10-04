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

        let tasksProgressInProgress = this.taskDao.findAll({
            $filter: {
                equals: {
                    StatusType: 2
                }
            }
        });

        let tasksProgressDevelopingFeature = this.taskDao.findAll({
            $filter: {
                equals: {
                    StatusType: 3
                }
            }
        });

        let tasksProgressDeprecated = this.taskDao.findAll({
            $filter: {
                equals: {
                    StatusType: 4
                }
            }
        });

        let tasksProgressResearch = this.taskDao.findAll({
            $filter: {
                equals: {
                    StatusType: 5
                }
            }
        });

        const tasksDoneLenght: number = !tasksProgressDone || tasksProgressDone.length === 0 ? 0 : tasksProgressDone.length;
        const tasksInProgress: number = !tasksProgressInProgress || tasksProgressInProgress.length === 0 ? 0 : tasksProgressInProgress.length;
        const tasksDevelopingFeature: number = !tasksProgressDevelopingFeature || tasksProgressDevelopingFeature.length === 0 ? 0 : tasksProgressDevelopingFeature.length;
        const tasksDeprecated: number = !tasksProgressDeprecated || tasksProgressDeprecated.length === 0 ? 0 : tasksProgressDeprecated.length;
        const tasksResearch: number = !tasksProgressResearch || tasksProgressResearch.length === 0 ? 0 : tasksProgressResearch.length;

        return {
            "TasksProgressDone": tasksDoneLenght,
            "TasksProgressInProgress": tasksInProgress,
            "TasksProgressDevelopingFeature": tasksDevelopingFeature,
            "TasksDeprecated": tasksDeprecated,
            "TasksResearch": tasksResearch
        };
    }


}