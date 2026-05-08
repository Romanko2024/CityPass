using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CityPass.Migrations
{
    /// <inheritdoc />
    public partial class MoveTo3NF : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // migrationBuilder.DropColumn(
            //    name: "RouteNumber",
            //    table: "Trips");

            // migrationBuilder.AddColumn<int>(
            //    name: "RouteId",
            //    table: "Trips",
            //    type: "integer",
            //    nullable: false,
            //    defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Trips_RouteId",
                table: "Trips",
                column: "RouteId");

            migrationBuilder.AddForeignKey(
                name: "FK_Trips_Routes_RouteId",
                table: "Trips",
                column: "RouteId",
                principalTable: "Routes",
                principalColumn: "RouteId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Trips_Routes_RouteId",
                table: "Trips");

            migrationBuilder.DropIndex(
                name: "IX_Trips_RouteId",
                table: "Trips");

            migrationBuilder.DropColumn(
                name: "RouteId",
                table: "Trips");

            migrationBuilder.AddColumn<string>(
                name: "RouteNumber",
                table: "Trips",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
