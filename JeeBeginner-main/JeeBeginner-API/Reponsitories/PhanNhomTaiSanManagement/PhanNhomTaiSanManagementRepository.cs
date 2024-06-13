using DpsLibs.Data;
using JeeBeginner.Models.Common;
using JeeBeginner.Models.PhanNhomTaiSanManagement;
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
namespace JeeBeginner.Reponsitories.PhanNhomTaiSanManagement
{
    public class PhanNhomTaiSanManagementRepository : IPhanNhomTaiSanManagementRepository
    {
        private readonly string _connectionString;

        public PhanNhomTaiSanManagementRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }
        public async Task<IEnumerable<PhanNhomTaiSanModel>> GetAll(SqlConditions conds, string orderByStr, string whereStr)
        {

            DataTable dt = new DataTable();
            string sql = "";

            if (string.IsNullOrEmpty(whereStr))
            {
                sql = $@"select IdPNTS,MaNhom,TenNhom,TrangThai from TS_DM_PhanNhomTS order by {orderByStr}   ";
            }
            else
            {
                sql = $@"select IdPNTS,MaNhom,TenNhom,TrangThai from TS_DM_PhanNhomTS where {whereStr} order by {orderByStr}";
            }
            using (DpsConnection cnn = new DpsConnection(_connectionString))
            {
                dt = cnn.CreateDataTable(sql);
                var result = dt.AsEnumerable().Select(row => new PhanNhomTaiSanModel
                {
                    IdPNTS = Int32.Parse(row["IdPNTS"].ToString()),
                    MaNhom = row["MaNhom"].ToString(),
                    TenNhom = row["TenNhom"].ToString(),
                    TrangThai = Convert.ToBoolean((bool)row["TrangThai"]),
                    //CreatedDate = (row["CreatedDate"] != DBNull.Value) ? ((DateTime)row["CreatedDate"]).ToString("dd/MM/yyyy") : "",
                    //PartnerName = row["PartnerName"].ToString(),
                    //LastLogin = (row["LastLogin"] != DBNull.Value) ? ((DateTime)row["LastLogin"]).ToString("dd/MM/yyyy HH:mm:ss") : "",
                });
                return await Task.FromResult(result);
            }
        }
        public async Task<ReturnSqlModel> CreatePhanNhomTaiSan(PhanNhomTaiSanModel model, long CreatedBy)
        {
            using (DpsConnection cnn = new DpsConnection(_connectionString))
            {
                try
                {
                    var val = InitDataPhanNhomTaiSan(model, CreatedBy);
                    int x = cnn.Insert(val, "TS_DM_PhanNhomTS");
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
        public async Task<PhanNhomTaiSanModel> GetOneModelByRowID(int IdPNTS)
        {
            DataTable dt = new DataTable();
            SqlConditions Conds = new SqlConditions();
            Conds.Add("IdPNTS", IdPNTS);
            string sql = @"select IdPNTS,MaNhom,TenNhom,TrangThai from TS_DM_PhanNhomTS where IdPNTS = @IdPNTS";
            using (DpsConnection cnn = new DpsConnection(_connectionString))
            {
                dt = await cnn.CreateDataTableAsync(sql, Conds);
                var result = dt.AsEnumerable().Select(row => new PhanNhomTaiSanModel
                {
                    IdPNTS = Int32.Parse(row["IdPNTS"].ToString()),
                    MaNhom = row["MaNhom"].ToString(),
                    TenNhom = row["TenNhom"].ToString(),
                    TrangThai = Convert.ToBoolean((bool)row["TrangThai"]),

                }).SingleOrDefault();
                return await Task.FromResult(result);
            }
        }

        private Hashtable InitDataPhanNhomTaiSan(PhanNhomTaiSanModel lmh, long CreatedBy, bool isUpdate = false)
        {
       
            Hashtable val = new Hashtable();
            val.Add("MaNhom", lmh.MaNhom);
            val.Add("TenNhom", lmh.TenNhom);
            val.Add("TrangThai", lmh.TrangThai);
            if (!isUpdate)
            {
            }
            else
            {

            }
            return val;
        }

        public async Task<ReturnSqlModel> UpdatePhanNhomTaiSan(PhanNhomTaiSanModel model, long CreatedBy)
        {
            Hashtable val = new Hashtable();
            SqlConditions conds = new SqlConditions();
            using (DpsConnection cnn = new DpsConnection(_connectionString))
            {
                try
                {
                    conds.Add("IdPNTS", model.IdPNTS);
                    val = InitDataPhanNhomTaiSan(model, CreatedBy, true);
                    int x = cnn.Update(val, conds, "TS_DM_PhanNhomTS");
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

        public async Task<ReturnSqlModel> Delete(PhanNhomTaiSanModel model, long DeleteBy)
        {
            Hashtable val = new Hashtable();
            SqlConditions conds = new SqlConditions();
            using (DpsConnection cnn = new DpsConnection(_connectionString))
            {
                try
                {
                    conds.Add("IdPNTS", model.IdPNTS);
                    if (model.TrangThai)
                    {
                        val.Add("TrangThai", 0);
                    }
                    else
                    {
                        val.Add("TrangThai", 1);
                    }
                    int x = cnn.Update(val, conds, "TS_DM_PhanNhomTS");
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
                        _item.Add("TrangThai", 1);
                        cnn.BeginTransaction();
                        if (cnn.Update(_item, new SqlConditions { { "IdPNTS", _Id } }, "TS_DM_PhanNhomTS") != 1)
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
        public Task<ReturnSqlModel> UpdateStatusPhanNhomTaiSan(PhanNhomTaiSanModel model, long DeleteBy)
        {
            throw new NotImplementedException();
        }
    }
}
