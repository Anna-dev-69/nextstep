import { containsTerm, normalize } from "./text";

export type CatalogSkill = {
  name: string;
  aliases: string[];
  projectIdea: string;
};

/**
 * Словарь закрывает частые формулировки и даёт идею проекта.
 * Навык из профиля тоже ищется в тексте, даже если его здесь нет.
 */
export const CATALOG: CatalogSkill[] = [
  {
    name: "JavaScript",
    aliases: ["javascript", "js", "ecmascript"],
    projectIdea:
      "Собери страницу с поиском по списку навыков без фреймворка: состояние в модуле, обработка пустого ввода и запрос к JSON.",
  },
  {
    name: "TypeScript",
    aliases: ["typescript", "ts"],
    projectIdea:
      "Опиши навыки, уровни и вакансию типами и разбери входящий JSON так, чтобы недопустимый уровень не проходил без any.",
  },
  {
    name: "HTML",
    aliases: ["html", "html5"],
    projectIdea:
      "Сверстай анкету навыка на семантических тегах: форма, список, подписи полей и сообщение об ошибке без стилей.",
  },
  {
    name: "CSS",
    aliases: ["css", "css3"],
    projectIdea:
      "Собери карточку вакансии, которая остаётся читаемой на узком экране: сетка, отступы и состояния наведения.",
  },
  {
    name: "React",
    aliases: ["react", "react.js", "reactjs"],
    projectIdea:
      "Сделай список навыков с формой уровня: добавление, правка и отдельный экран, когда навыков ещё нет.",
  },
  {
    name: "Next.js",
    aliases: ["next.js", "nextjs", "next js"],
    projectIdea:
      "Собери страницу вакансии, которая на сервере читает разбор требований и показывает, какие навыки уже закрыты.",
  },
  {
    name: "Vue",
    aliases: ["vue", "vue.js", "vuejs"],
    projectIdea:
      "Собери форму повторной оценки навыка: текущий уровень, новый уровень и разница между ними.",
  },
  {
    name: "Angular",
    aliases: ["angular", "angularjs"],
    projectIdea:
      "Сделай экран плана на неделю: пункты приходят из сервиса, статус переключается через форму.",
  },
  {
    name: "Node.js",
    aliases: ["node.js", "nodejs", "node js"],
    projectIdea:
      "Напиши небольшой HTTP-сервис, который принимает навык, проверяет уровень и возвращает понятную ошибку.",
  },
  {
    name: "Python",
    aliases: ["python", "питон"],
    projectIdea:
      "Напиши скрипт, который читает текст вакансии из файла и печатает найденные требования по строкам.",
  },
  {
    name: "Java",
    aliases: ["java"],
    projectIdea:
      "Собери консольное приложение с классами Навык и Оценка и сохрани историю уровней в файл.",
  },
  {
    name: "Kotlin",
    aliases: ["kotlin", "котлин"],
    projectIdea:
      "Опиши модель плана data-классами и покрой выбор срока 2–4 недели тестом на граничные значения.",
  },
  {
    name: "C#",
    aliases: ["c#", "csharp", "c sharp"],
    projectIdea:
      "Сделай API навыка на минимальном веб-шаблоне: создать запись, получить список, отклонить уровень вне 1–5.",
  },
  {
    name: "Go",
    aliases: ["golang", "go lang", "go"],
    projectIdea:
      "Напиши обработчик, который принимает JSON вакансии и возвращает список требований без лишних полей.",
  },
  {
    name: "SQL",
    aliases: ["sql"],
    projectIdea:
      "Спроектируй таблицы навыков, оценок и проектов и напиши запрос: уровень сейчас и уровень месяц назад.",
  },
  {
    name: "PostgreSQL",
    aliases: ["postgresql", "postgres", "постгрес"],
    projectIdea:
      "Подними локальную базу, заведи навыки и оценки и выбери навыки, чей последний уровень вырос.",
  },
  {
    name: "MongoDB",
    aliases: ["mongodb", "mongo db", "mongo"],
    projectIdea:
      "Сохрани вакансию документом с вложенным списком требований и найди документы, где есть конкретный навык.",
  },
  {
    name: "Redis",
    aliases: ["redis"],
    projectIdea:
      "Положи в Redis черновик плана с коротким сроком жизни и покажи, что по истечении ключа его уже нет.",
  },
  {
    name: "Git",
    aliases: ["git", "github", "gitlab"],
    projectIdea:
      "Веди учебный репозиторий маленькими коммитами: отдельная ветка на проект из плана и понятные сообщения.",
  },
  {
    name: "Docker",
    aliases: ["docker", "dockerfile", "docker compose", "docker-compose"],
    projectIdea:
      "Упакуй учебный сервис в образ и опиши в README одну команду, которой его можно запустить.",
  },
  {
    name: "Kubernetes",
    aliases: ["kubernetes", "k8s"],
    projectIdea:
      "Опиши деплой учебного сервиса манифестом и добейся, чтобы локальный кластер открывал его страницу.",
  },
  {
    name: "Linux",
    aliases: ["linux", "bash"],
    projectIdea:
      "Напиши bash-скрипт, который создаёт папку проекта, проверяет зависимости и печатает, чего не хватает.",
  },
  {
    name: "CI/CD",
    aliases: ["ci/cd", "cicd", "ci cd", "github actions", "gitlab ci"],
    projectIdea:
      "Добавь workflow, который на каждый push запускает проверку типов и не даёт смешать сломанную ветку.",
  },
  {
    name: "Тестирование",
    aliases: ["тестирование", "автотесты", "unit tests", "unit-тесты", "testing"],
    projectIdea:
      "Покрой разбор одной вакансии тестами: обязательный навык, навык «будет плюсом» и навык, которого нет в тексте.",
  },
  {
    name: "REST API",
    aliases: ["rest api", "restful", "rest-api"],
    projectIdea:
      "Опиши контракт навыков: какие поля у POST, какой код у повторного имени и как выглядит тело ошибки.",
  },
  {
    name: "GraphQL",
    aliases: ["graphql", "graph ql"],
    projectIdea:
      "Собери схему Skill и Plan и запрос, который забирает навык вместе с последними двумя оценками.",
  },
  {
    name: "AWS",
    aliases: ["aws", "amazon web services"],
    projectIdea:
      "Выложи статическую страницу портфолио в облачное хранилище и открой её по публичной ссылке.",
  },
  {
    name: "System Design",
    aliases: ["system design", "проектирование систем", "системный дизайн"],
    projectIdea:
      "Нарисуй схему этого навигатора: кто хранит навыки, кто читает вакансию и где рождается план. Одна страница.",
  },
  {
    name: "Алгоритмы",
    aliases: ["алгоритмы", "algorithms", "структуры данных", "data structures"],
    projectIdea:
      "Реши 5 задач на массивы и строки и запиши для каждой сложность решения в README.",
  },
  {
    name: "Machine Learning",
    aliases: ["machine learning", "машинное обучение"],
    projectIdea:
      "Обучи простую модель на открытом табличном наборе и покажи, на каких примерах она ошибается.",
  },
  {
    name: "LLM",
    aliases: ["llm", "llms", "chatgpt", "openai", "prompt engineering", "промпт", "промпты"],
    projectIdea:
      "Сравни два промпта на одном тексте вакансии и запиши, какой список требований получился точнее и почему.",
  },
  {
    name: "Pandas",
    aliases: ["pandas"],
    projectIdea:
      "Загрузи таблицу вакансий, посчитай частые навыки и сохрани результат в короткий отчёт.",
  },
  {
    name: "Tailwind CSS",
    aliases: ["tailwind", "tailwindcss", "tailwind css"],
    projectIdea:
      "Собери экран пробелов по вакансии: обязательные и желательные требования визуально отличаются.",
  },
  {
    name: "Figma",
    aliases: ["figma"],
    projectIdea:
      "Собери макет одного экрана навигатора: список навыков, поле вакансии и план на две недели.",
  },
  {
    name: "Agile",
    aliases: ["agile", "scrum", "kanban"],
    projectIdea:
      "Разложи учебный проект на доску из трёх колонок и проведи план на две недели как короткий спринт.",
  },
  {
    name: "Английский",
    aliases: ["английский", "английского", "english"],
    projectIdea:
      "Перескажи одну вакансию на английском в десяти предложениях и выпиши из неё требования своими словами.",
  },
  {
    name: "Коммуникация",
    aliases: ["коммуникабельность", "communication skills"],
    projectIdea:
      "Подготовь пятиминутный рассказ о учебном проекте: задача, что сделано и какой пункт вакансии он закрывает.",
  },
];

export function findCatalogSkill(name: string): CatalogSkill | undefined {
  const key = normalize(name);
  return CATALOG.find(
    (skill) =>
      normalize(skill.name) === key ||
      skill.aliases.some((alias) => normalize(alias) === key),
  );
}

/** React.js и React сходятся к одному ключу, если оба есть в словаре. */
export function skillKey(name: string): string {
  const known = findCatalogSkill(name);
  return normalize(known?.name ?? name);
}

export function projectIdeaFor(name: string): string {
  return (
    findCatalogSkill(name)?.projectIdea ??
    `Собери небольшой законченный проект, где «${name}» закрывает один пункт вакансии, и опиши это в README.`
  );
}

export function searchTerms(skill: CatalogSkill): string[] {
  const terms = [skill.name, ...skill.aliases]
    .map((term) => normalize(term))
    .filter((term) => term.length >= 2);

  return [...new Set(terms)].sort((left, right) => right.length - left.length);
}

export function lineHasTerm(line: string, term: string): boolean {
  return containsTerm(normalize(line), term);
}
