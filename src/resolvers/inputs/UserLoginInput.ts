/* eslint-disable indent */
import { Field, InputType } from 'type-graphql';

@InputType('UserLoginInput', { isAbstract: true })
export class UserLoginInput {
    @Field(() => String, { nullable: false })
    email!: string;

    @Field(() => String, { nullable: false })
    password!: string;
}
