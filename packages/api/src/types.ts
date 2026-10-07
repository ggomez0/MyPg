export type AppEnv = {
  Variables: {
    adminId: string;
    projectId: string;
    userId: string;
    role: string;
    authType: "apikey" | "user";
  };
};
