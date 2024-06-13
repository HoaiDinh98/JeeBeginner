using DpsLibs.Data;
using JeeBeginner.Models.Common;
using JeeBeginner.Models.DonViTinhManagement;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Collections;
using System.Data;
using System.Threading.Tasks;
using System;
using Confluent.Kafka;
using DpsLibs.Data;
using JeeBeginner.Classes;
using JeeBeginner.Models.Common;
using JeeBeginner.Models.CustomerManagement;
using JeeBeginner.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Security.Cryptography;
using System.Security.Principal;
using System.Data.SqlClient;

using OfficeOpenXml.Style;
using OfficeOpenXml;
using System.Data.SqlClient;
using System.Drawing;
using System.IO;

namespace JeeBeginner.Reponsitories.DonViTinhManagement
{
    public class DonViTinhManagementRepository : IDonViTinhManagementRepository
    {
        private readonly string _connectionString;

        public DonViTinhManagementRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }
        public async Task<IEnumerable<DonViTinhModel>> GetAll(SqlConditions conds, string orderByStr, string whereStr)
        {

            DataTable dt = new DataTable();
            string sql = "";

            if (string.IsNullOrEmpty(whereStr))
            {
                sql = $@"select DM_DVT.* from DM_DVT where (where) order by {orderByStr}   ";
            }
            else
            {
                sql = $@"select DM_DVT.* from DM_DVT where (where) and {whereStr} order by {orderByStr}";
            }
            using (DpsConnection cnn = new DpsConnection(_connectionString))
            {
                dt = cnn.CreateDataTable(sql, "(where)", conds);
                var result = dt.AsEnumerable().Select(row => new DonViTinhModel
                {
                    IdDVT = Int32.Parse(row["IdDVT"].ToString()),
                    TenDVT = row["TenDVT"].ToString(),
                    IdCustomer = Int32.Parse(row["IdCustomer"].ToString()),
                    isDel = Convert.ToBoolean((bool)row["isDel"]),
                    //CreatedDate = (row["CreatedDate"] != DBNull.Value) ? ((DateTime)row["CreatedDate"]).ToString("dd/MM/yyyy") : "",
                    //PartnerName = row["PartnerName"].ToString(),
                    //LastLogin = (row["LastLogin"] != DBNull.Value) ? ((DateTime)row["LastLogin"]).ToString("dd/MM/yyyy HH:mm:ss") : "",
                });
                return await Task.FromResult(result);
            }
        }
        public async Task<ReturnSqlModel> CreateDonViTinh(DonViTinhModel model, long CreatedBy)
        {
            using (DpsConnection cnn = new DpsConnection(_connectionString))
            {
                try
                {
                    var val = InitDataDonViTinh(model, CreatedBy);
                    int x = cnn.Insert(val, "DM_DVT");
                    if (x <= 0)
                    {
                        return await Task.FromResult(new ReturnSqlModel(cnn.LastError.ToString(), Constant.ERRORCODE_EXCEPTION));
                    }
                }
                catch (Exception ex)
                {
                    return await Task.FromResult(new ReturnSqlModel(ex.Message, Constant.ERRORCODE_EXCEPTION));
                }
            }
            return await Task.FromResult(new ReturnSqlModel());
        }
        public async Task<DonViTinhModel> GetOneModelByRowID(int IdDonViTinh)
        {
            DataTable dt = new DataTable();
            SqlConditions Conds = new SqlConditions();
            Conds.Add("IdDVT", IdDonViTinh);
            string sql = @"select * from DM_DVT where IdDVT = @IdDVT";
            using (DpsConnection cnn = new DpsConnection(_connectionString))
            {
                dt = await cnn.CreateDataTableAsync(sql, Conds);
                var result = dt.AsEnumerable().Select(row => new DonViTinhModel
                {
                    IdDVT = Int32.Parse(row["IdDVT"].ToString()),
                    TenDVT = row["TenDVT"].ToString(),
                    IdCustomer = Int32.Parse(row["IdCustomer"].ToString()),
                    isDel = Convert.ToBoolean((bool)row["isDel"]),

                }).SingleOrDefault();
                return await Task.FromResult(result);
            }
        }

        private Hashtable InitDataDonViTinh(DonViTinhModel lmh, long CreatedBy, bool isUpdate = false)
        {
            Hashtable val = new Hashtable();
            val.Add("TenDVT", lmh.TenDVT);
            val.Add("IdCustomer", lmh.IdCustomer);
            val.Add("isDel", 0);
            if (!isUpdate)
            {
                val.Add("CreatedDate", DateTime.UtcNow);
                val.Add("CreatedBy", CreatedBy);
            }
            else
            {
                val.Add("ModifiedDate", DateTime.UtcNow);
                val.Add("ModifiedBy", CreatedBy);

            }
            return val;
        }

        public async Task<ReturnSqlModel> UpdateDonViTinh(DonViTinhModel model, long CreatedBy)
        {
            Hashtable val = new Hashtable();
            SqlConditions conds = new SqlConditions();
            using (DpsConnection cnn = new DpsConnection(_connectionString))
            {
                try
                {
                    conds.Add("IdDVT", model.IdDVT);
                    val = InitDataDonViTinh(model, CreatedBy, true);
                    int x = cnn.Update(val, conds, "DM_DVT");
                    if (x <= 0)
                    {
                        return await Task.FromResult(new ReturnSqlModel(cnn.LastError.ToString(), Constant.ERRORCODE_SQL));
                    }
                }
                catch (Exception ex)
                {
                    cnn.RollbackTransaction();
                    cnn.EndTransaction();
                    return await Task.FromResult(new ReturnSqlModel(ex.Message, Constant.ERRORCODE_EXCEPTION));
                }
            }
            return await Task.FromResult(new ReturnSqlModel());
        }

        public async Task<ReturnSqlModel> Delete(DonViTinhModel model, long DeleteBy)
        {
            Hashtable val = new Hashtable();
            SqlConditions conds = new SqlConditions();
            using (DpsConnection cnn = new DpsConnection(_connectionString))
            {
                try
                {
                    conds.Add("IdDVT", model.IdDVT);
                    if (model.isDel)
                    {
                        val.Add("isDel", 0);
                        val.Add("DeleteBy", DeleteBy);
                        val.Add("DeleteDate", DateTime.UtcNow);
                    }
                    else
                    {
                        val.Add("isDel", 1);
                        val.Add("DeleteBy", DeleteBy);
                        val.Add("DeleteDate", DateTime.UtcNow);
                    }
                    int x = cnn.Update(val, conds, "DM_DVT");
                    if (x <= 0)
                    {
                        return await Task.FromResult(new ReturnSqlModel(cnn.LastError.ToString(), Constant.ERRORCODE_SQL));
                    }
                }
                catch (Exception ex)
                {
                    cnn.RollbackTransaction();
                    cnn.EndTransaction();
                    return await Task.FromResult(new ReturnSqlModel(ex.Message, Constant.ERRORCODE_EXCEPTION));
                }
            }
            return await Task.FromResult(new ReturnSqlModel());
        }
        public async Task<ReturnSqlModel> Deletes(decimal[] ids, long DeleteBy)
        {
            Hashtable val = new Hashtable();
            SqlConditions conds = new SqlConditions();
            using (DpsConnection cnn = new DpsConnection(_connectionString))
            {
                try
                {
                    foreach (long _Id in ids)
                    {
                        Hashtable _item = new Hashtable();
                        _item.Add("isDel", 1);
                        _item.Add("DeleteBy", DeleteBy);
                        _item.Add("DeleteDate", DateTime.Now);
                        cnn.BeginTransaction();
                        if (cnn.Update(_item, new SqlConditions { { "IdDVT", _Id } }, "DM_DVT") != 1)
                        {
                            cnn.RollbackTransaction();
                        }
                    }
                    cnn.EndTransaction();
                }
                catch (Exception ex)
                {
                    cnn.RollbackTransaction();
                    cnn.EndTransaction();
                    return await Task.FromResult(new ReturnSqlModel(ex.Message, Constant.ERRORCODE_EXCEPTION));
                }
            }
            return await Task.FromResult(new ReturnSqlModel());
        }
        public Task<ReturnSqlModel> UpdateStatusDonViTinh(DonViTinhModel model, long DeleteBy)
        {
            throw new NotImplementedException();
        }
        #region Export File Excel
        public async Task<FileContentResult> Export(string whereStr)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                using (var command = new SqlCommand("select ROW_NUMBER() OVER (ORDER BY IdDVT) AS 'STT',TenDVT as N'Tên Đơn Vị TÍnh'  from DM_DVT where TenDVT LIKE '%" + whereStr + "%' and  DeleteDate is null and DM_DVT.isDel =0", connection))
                {
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        using (var package = new ExcelPackage())
                        {
                            var worksheet = package.Workbook.Worksheets.Add("Data");

                            for (int i = 0; i < reader.FieldCount; i++)
                            {
                                worksheet.Cells[1, i + 1].Value = reader.GetName(i);
                                worksheet.Cells[1, i + 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                                worksheet.Cells[1, i + 1].Style.Font.Bold = true;
                                worksheet.Cells[1, i + 1].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                worksheet.Cells[1, i + 1].Style.Fill.BackgroundColor.SetColor(Color.LightGreen);
                            }
                            int row = 2;
                            while (await reader.ReadAsync())
                            {
                                for (int i = 0; i < reader.FieldCount; i++)
                                {
                                    if (i == 0 || i == 1 || i == 5)
                                    {
                                        worksheet.Cells[row, i + 1].Value = reader[i];
                                        worksheet.Cells[row, i + 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                                    }
                                    else
                                    {
                                        worksheet.Cells[row, i + 1].Value = reader[i];
                                        worksheet.Cells[row, i + 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
                                    }

                                }
                                if (row % 2 == 0)
                                {
                                    for (int i = 1; i <= reader.FieldCount; i++)
                                    {
                                        worksheet.Cells[row, i].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                        worksheet.Cells[row, i].Style.Fill.BackgroundColor.SetColor(Color.LightGray);
                                    }
                                }
                                row++;
                            }
                            worksheet.Cells.AutoFitColumns();

                            var border = worksheet.Cells[worksheet.Dimension.Address].Style.Border;
                            border.Top.Style = border.Left.Style = border.Right.Style = border.Bottom.Style = ExcelBorderStyle.Thin;
                            var stream = new MemoryStream(package.GetAsByteArray());

                            // Trả về file Excel
                            return new FileContentResult(stream.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                            {
                                FileDownloadName = "Data.xlsx"
                            };

                        }
                    }
                }
            }
        }
        #endregion

    }
}
