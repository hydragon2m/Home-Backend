import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddPageIconAndCoverToNotes1775105247915 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "notes",
            new TableColumn({
                name: "icon",
                type: "varchar",
                isNullable: true,
            })
        );
        await queryRunner.addColumn(
            "notes",
            new TableColumn({
                name: "cover",
                type: "varchar",
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("notes", "cover");
        await queryRunner.dropColumn("notes", "icon");
    }

}
