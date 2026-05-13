using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CityPass.Migrations
{
    /// <inheritdoc />
    public partial class AddAppliedCategoryToTrip : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AppliedCategoryId",
                table: "Trips",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Trips_AppliedCategoryId",
                table: "Trips",
                column: "AppliedCategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Trips_Categories_AppliedCategoryId",
                table: "Trips",
                column: "AppliedCategoryId",
                principalTable: "Categories",
                principalColumn: "CategoryId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Trips_Categories_AppliedCategoryId",
                table: "Trips");

            migrationBuilder.DropIndex(
                name: "IX_Trips_AppliedCategoryId",
                table: "Trips");

            migrationBuilder.DropColumn(
                name: "AppliedCategoryId",
                table: "Trips");
        }
    }
}
