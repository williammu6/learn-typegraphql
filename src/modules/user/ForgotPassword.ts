import { Resolver, Mutation, Arg } from "type-graphql";
import { v4 } from "uuid";
import { redis } from "../../redis";
import { sendEmail } from "../utils/sendEmail";
import { forgotPasswordPrefix } from "../constants/redisPrefixes";
import { User } from "../../entity/User";

@Resolver()
export class ForgotPasswordResolver {
  @Mutation(() => Boolean)
  async forgotPassword(@Arg("email") email: string): Promise<boolean> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return true;
    }
    const token = v4();

    await redis.set(forgotPasswordPrefix + token, user.id, "ex", 60 * 60 * 24);

    await sendEmail(
      user.email,
      `http://localhost:3000/user/change-password/${token}`
    );

    return true;
  }
}
