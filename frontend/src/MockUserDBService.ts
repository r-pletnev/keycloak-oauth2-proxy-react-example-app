export class MockUser {
  id: string;
  email: string;
  fullName: string;
  avatar: string;
  username: string;
  password: string;
  role: "admin" | "user";

  constructor(
    id: string,
    fullName: string,
    avatar: string,
    username: string,
    password: string,
    role: "admin" | "user"
  ) {
    this.id = id;
    this.fullName = fullName;
    this.avatar = avatar;
    this.username = username;
    this.password = password;
    this.role = role;
  }
}

const usersDb: MockUser[] = [
  {
    id: "1",
    email: "admin@example.com",
    fullName: "John Doe (Admin)",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    username: "john",
    password: "password",
    role: "admin",
  },
  {
    id: "2",
    email: "user1@example.com",
    fullName: "Jane Doe (User)",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    username: "jane",
    password: "password",
    role: "user",
  },
];

export class MockUserDBService {
  public static getUserByUsername(username: string) {
    return usersDb.find((user) => user.username === username);
  }

  public static getUserById(id: string) {
    return usersDb.find((user) => user.id === id);
  }

  public static getUserByEmail(email: string) {
    return usersDb.find((user) => user.email === email);
  }
}
