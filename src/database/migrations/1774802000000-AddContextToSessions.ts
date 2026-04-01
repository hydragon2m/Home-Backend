import { MigrationInterface, QueryRunner } from "typeorm";

export class AddContextToSessions1774802000000 implements MigrationInterface {
    name = 'AddContextToSessions1774802000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" ADD "orgId" character varying`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "role" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "role"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "orgId"`);
    }

}
