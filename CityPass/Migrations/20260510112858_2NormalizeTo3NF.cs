using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CityPass.Migrations
{
    /// <inheritdoc />
    public partial class _2NormalizeTo3NF : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            //migrationBuilder.DropForeignKey(
                //name: "FK_Passengers_Categories_CategoryId",
                //table: "Passengers");

            //migrationBuilder.DropIndex(
               // name: "IX_Passengers_CategoryId",
                //table: "Passengers");

            //migrationBuilder.DropColumn(
               // name: "CategoryId",
                //table: "Passengers");

            migrationBuilder.CreateIndex(
                name: "IX_Trips_PassengerId",
                table: "Trips",
                column: "PassengerId");

            migrationBuilder.CreateIndex(
                name: "IX_Trips_TransportId",
                table: "Trips",
                column: "TransportId");

            migrationBuilder.CreateIndex(
                name: "IX_Routes_TransportId",
                table: "Routes",
                column: "TransportId");

            migrationBuilder.AddForeignKey(
                name: "FK_Routes_Transports_TransportId",
                table: "Routes",
                column: "TransportId",
                principalTable: "Transports",
                principalColumn: "TransportID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Trips_Passengers_PassengerId",
                table: "Trips",
                column: "PassengerId",
                principalTable: "Passengers",
                principalColumn: "PassengerId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Trips_Transports_TransportId",
                table: "Trips",
                column: "TransportId",
                principalTable: "Transports",
                principalColumn: "TransportID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Routes_Transports_TransportId",
                table: "Routes");

            migrationBuilder.DropForeignKey(
                name: "FK_Trips_Passengers_PassengerId",
                table: "Trips");

            migrationBuilder.DropForeignKey(
                name: "FK_Trips_Transports_TransportId",
                table: "Trips");

            migrationBuilder.DropIndex(
                name: "IX_Trips_PassengerId",
                table: "Trips");

            migrationBuilder.DropIndex(
                name: "IX_Trips_TransportId",
                table: "Trips");

            migrationBuilder.DropIndex(
                name: "IX_Routes_TransportId",
                table: "Routes");

            migrationBuilder.AddColumn<int>(
                name: "CategoryId",
                table: "Passengers",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Passengers_CategoryId",
                table: "Passengers",
                column: "CategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Passengers_Categories_CategoryId",
                table: "Passengers",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "CategoryId");
        }
    }
}
