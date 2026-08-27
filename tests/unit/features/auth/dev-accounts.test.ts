describe("DEV_ACCOUNTS", () => {
  const originalEnv = process.env.EXPO_PUBLIC_DEV_ACCOUNT_PASSWORD;

  afterEach(() => {
    process.env.EXPO_PUBLIC_DEV_ACCOUNT_PASSWORD = originalEnv;
  });

  it("fica vazio quando a variável de ambiente não está definida", () => {
    delete process.env.EXPO_PUBLIC_DEV_ACCOUNT_PASSWORD;
    jest.isolateModules(() => {
      const { DEV_ACCOUNTS } = require("@features/auth/dev-accounts");
      expect(DEV_ACCOUNTS).toEqual([]);
    });
  });

  it("vem preenchido com a senha da variável de ambiente quando definida", () => {
    process.env.EXPO_PUBLIC_DEV_ACCOUNT_PASSWORD = "test-only-password";
    jest.isolateModules(() => {
      const { DEV_ACCOUNTS } = require("@features/auth/dev-accounts");
      expect(DEV_ACCOUNTS).toHaveLength(2);
      expect(DEV_ACCOUNTS.every((account: { password: string }) => account.password === "test-only-password")).toBe(true);
    });
  });
});
