import { types } from "mobx-state-tree";

const Que = types.model("Question", {
  question: types.string,
  parentId: types.string,
  weightage: types.string,
  function: types.string,
  answerOptions: types.array(types.string),
  id: types.identifier,
  domain: types.string,
  description: types.string,
  control: types.string,
  methods: types.string
});

const QuestionList = types
  .model("QuestionList", {
    all: types.maybe(types.array(Que))
  })
  .views(self => ({
    withFunction(func) {
      return self.all.filter(({ function: sFunc }) => sFunc === func);
    }
  }));

export default QuestionList;
