import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserProfiles1774801395687 implements MigrationInterface {
    name = 'UpdateUserProfiles1774801395687'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "name" character varying NOT NULL DEFAULT 'User'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "avatar" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "phone_number" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "bio" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "bio"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phone_number"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatar"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "name"`);
    }

}
