import { getStudent, mockStudents } from "@shared/mocks/coach-students.mock";

describe("getStudent", () => {
  it("retorna o aluno quando o id existe", () => {
    const first = mockStudents[0]!;
    expect(getStudent(first.id)).toBe(first);
  });

  it("retorna undefined quando o id não existe", () => {
    expect(getStudent("id-inexistente")).toBeUndefined();
  });
});
