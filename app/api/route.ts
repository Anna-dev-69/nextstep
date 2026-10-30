import { SKILL_LEVEL_LABEL, SKILL_LEVELS } from "@/lib/server/types";

const endpoints = [
  { method: "GET", path: "/api/skills", purpose: "Список навыков и текущих уровней" },
  { method: "POST", path: "/api/skills", purpose: "Добавить навык и первую оценку" },
  { method: "GET", path: "/api/skills/:id", purpose: "Навык и история оценок" },
  { method: "PATCH", path: "/api/skills/:id", purpose: "Переименовать навык" },
  { method: "DELETE", path: "/api/skills/:id", purpose: "Удалить навык и его оценки" },
  { method: "GET", path: "/api/skills/:id/assessments", purpose: "История оценок навыка" },
  { method: "POST", path: "/api/skills/:id/assessments", purpose: "Новая оценка: обновляет уровень и хранит прошлый" },
  { method: "GET", path: "/api/vacancies", purpose: "Список сохранённых вакансий" },
  { method: "POST", path: "/api/vacancies", purpose: "Сохранить текст вакансии и сразу сопоставить его с навыками" },
  { method: "GET", path: "/api/vacancies/:id", purpose: "Свежее сопоставление вакансии с текущими навыками" },
  { method: "DELETE", path: "/api/vacancies/:id", purpose: "Удалить вакансию и её планы" },
  { method: "POST", path: "/api/vacancies/:id/plan", purpose: "Собрать план на 2–4 недели по текущим пробелам" },
  { method: "GET", path: "/api/plans/:id", purpose: "План и его пункты по неделям" },
  { method: "PATCH", path: "/api/plans/:id/items/:itemId", purpose: "Отметить прогресс пункта: todo, in_progress, done" },
  { method: "GET", path: "/api/projects", purpose: "Список проектов" },
  { method: "POST", path: "/api/projects", purpose: "Добавить проект и при желании связать его с пунктом плана" },
  { method: "GET", path: "/api/projects/:id", purpose: "Один проект" },
  { method: "PATCH", path: "/api/projects/:id", purpose: "Изменить проект или отметить его выполненным" },
  { method: "DELETE", path: "/api/projects/:id", purpose: "Удалить проект" },
  { method: "GET", path: "/api/progress", purpose: "Сравнить первую, предыдущую и текущую оценки" },
];

export function GET() {
  return Response.json({
    service: "NextStep",
    levels: SKILL_LEVELS.map((level) => ({
      level,
      label: SKILL_LEVEL_LABEL[level],
    })),
    endpoints,
  });
}
