/* eslint-disable indent */
import { Field, InputType } from 'type-graphql';

@InputType('UserRegisterInput', { isAbstract: true })
export class UserRegisterInput {
  @Field(() => String, { nullable: false })
  email!: string;

  @Field(() => String, { nullable: false })
  password!: string;

  @Field(() => String, { nullable: true })
  name!: string;
}
