﻿using Confluent.Kafka;
using DpsLibs.Data;
using JeeBeginner.Classes;
using JeeBeginner.Models.AccountRoleManagement;
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
using System.Threading.Tasks;

namespace JeeBeginner.Reponsitories.AccountRoleManagement
{
    public class AccountRoleManagementRepository : IAccountRoleManagementRepository
    {
        private readonly string _connectionString;

        public AccountRoleManagementRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        public async Task<ReturnSqlModel> CreateAccount(AccountRoleModel model, long CreatedBy)
        {
            using (DpsConnection cnn = new DpsConnection(_connectionString))
            {
                try
                {
                    var val = InitDataAccount(model, CreatedBy);
                    int x = cnn.Insert(val, "AccountList");
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

        private Hashtable InitDataAccount(AccountRoleModel account, long CreatedBy, bool isUpdate = false)
        {
            Hashtable val = new Hashtable();
            val.Add("PartnerID", account.PartnerId);
            val.Add("Fullname", account.Fullname);
            val.Add("Mobile", account.Mobile);
            val.Add("Email", account.Email);
            val.Add("Username", account.Username);
            val.Add("Password", DpsLibs.Common.EncDec.Encrypt(account.Password, Constant.PASSWORD_ED));
            val.Add("IsLock", 0);
            val.Add("Gender", account.Gender);
            val.Add("Note", account.Note);
            val.Add("IsMasterAccount", 0);
            if (!isUpdate)
            {
                val.Add("CreatedDate", DateTime.UtcNow);
                val.Add("CreatedBy", CreatedBy);
            }
            return val;
        }

        public async Task<IEnumerable<AccountRoleDTO>> GetAll(SqlConditions conds, string orderByStr)
        {
            DataTable dt = new DataTable();
            string sql = "";
            if (conds.Count == 0)
            {
                sql = $@"select AccountList.*, PartnerList.PartnerName 
                        from AccountList
                        join PartnerList 
                        on AccountList.PartnerID = PartnerList.RowID 
                        order by {orderByStr}";
            }
            else
            {
                sql = $@"select AccountList.*, PartnerList.PartnerName 
                        from AccountList
                        join PartnerList 
                        on AccountList.PartnerID = PartnerList.RowID 
                        where (where) order by {orderByStr}";
            }
            using (DpsConnection cnn = new DpsConnection(_connectionString))
            {
                dt = cnn.CreateDataTable(sql, "(where)", conds);
                var result = dt.AsEnumerable().Select(row => new AccountRoleDTO
                {
                    Username = row["Username"].ToString(),
                    Fullname = row["Fullname"].ToString(),
                    Mobile = row["Mobile"].ToString(),
                    Email = row["Email"].ToString(),
                    IsLock = Convert.ToBoolean((bool)row["IsLock"]),
                    RowId = Int32.Parse(row["RowID"].ToString()),
                    CreatedDate = (row["CreatedDate"] != DBNull.Value) ? ((DateTime)row["CreatedDate"]).ToString("dd/MM/yyyy") : "",
                    PartnerName = row["PartnerName"].ToString(),
                    LastLogin = (row["LastLogin"] != DBNull.Value) ? ((DateTime)row["LastLogin"]).ToString("dd/MM/yyyy HH:mm:ss") : "",
                });
                return await Task.FromResult(result);
            }
        }
        public async Task<IEnumerable<AccountRoleDTO>> GetAllAccounts(SqlConditions conds, string orderByStr)
        {
            DataTable dt = new DataTable();
            string sql = "";
            if (conds.Count == 0)
            {
                sql = $@"select AccountList.*, PartnerList.PartnerName 
                        from AccountList
                        join PartnerList 
                        on AccountList.PartnerID = PartnerList.RowID 
                        order by {orderByStr}";
            }
            else
            {
                sql = $@"select AccountList.*, PartnerList.PartnerName 
                        from AccountList
                        join PartnerList 
                        on AccountList.PartnerID = PartnerList.RowID 
                        where (where) order by {orderByStr}";
            }
            using (DpsConnection cnn = new DpsConnection(_connectionString))
            {
                dt = cnn.CreateDataTable(sql, "(where)", conds);
                var result = dt.AsEnumerable().Select(row => new AccountRoleDTO
                {
                    RowId = Int32.Parse(row["RowID"].ToString()),
                    Fullname = row["Fullname"].ToString(),
                    Mobile = row["Mobile"].ToString(),
                    Email = row["Email"].ToString(),
                    Username = row["Username"].ToString(),                                  
                    //IsLock = Convert.ToBoolean((bool)row["IsLock"]),                   
                    //CreatedDate = (row["CreatedDate"] != DBNull.Value) ? ((DateTime)row["CreatedDate"]).ToString("dd/MM/yyyy") : "",
                    PartnerName = row["PartnerName"].ToString(),
                    //LastLogin = (row["LastLogin"] != DBNull.Value) ? ((DateTime)row["LastLogin"]).ToString("dd/MM/yyyy HH:mm:ss") : "",
                });
                return await Task.FromResult(result);
            }
        }
        public async Task<IEnumerable<AccountRole>> GetAllRole(string  Username)
        {
            DataTable dt = new DataTable();
            SqlConditions Conds = new SqlConditions();
            Conds.Add("Username", Username);
            string sql = @"SELECT tbl_permision.Id_Permit, tbl_permision.Tenquyen,tbl_permision.IsReadPermit, COALESCE(tbl_account_permit.Edit, 0) AS Edit2
                        FROM tbl_permision
                        LEFT JOIN tbl_account_permit 
                        ON tbl_permision.Id_permit = tbl_account_permit.Id_Permit AND Username = @Username
                        WHERE (COALESCE(tbl_account_permit.Edit, 0) = 0 OR COALESCE(tbl_account_permit.Edit, 0) = 1)";
            using (DpsConnection cnn = new DpsConnection(_connectionString))
            {
                dt = await cnn.CreateDataTableAsync(sql, Conds);
                var result = dt.AsEnumerable().Select(row => new AccountRole
                {
                    Username = Username,
                    Id_Permit = Int32.Parse(row["Id_Permit"].ToString()),
                    Tenquyen = row["Tenquyen"].ToString(),
                    IsReadPermit = Convert.ToBoolean((bool)row["IsReadPermit"]),
                    Edit = row.Field<int>("Edit2") == 1
                });
                return await Task.FromResult(result);
            }
        }
        public async Task<IEnumerable<AccountRole>> GetRoleById(string Username)
        {
            DataTable dt = new DataTable();
            SqlConditions Conds = new SqlConditions();
            Conds.Add("Username", Username);
            string sql = @"SELECT Username, Id_Permit, Edit, Id_chucnang
                            FROM     tbl_account_permit
                            WHERE  (Username = @Username)";
            //string sql = @"SELECT tbl_account_permit.Id_Permit, tbl_permision.IsReadPermit, tbl_account_permit.Edit
            //            FROM tbl_permision,  tbl_account_permit 
            //            where tbl_permision.Id_permit = tbl_account_permit.Id_Permit AND Username = @Username";
            using (DpsConnection cnn = new DpsConnection(_connectionString))
            {
                dt = await cnn.CreateDataTableAsync(sql, Conds);
                var result = dt.AsEnumerable().Select(row => new AccountRole
                {
                    Username = Username,
                    Id_Permit = Int32.Parse(row["Id_Permit"].ToString()),
                    //IsReadPermit = Convert.ToBoolean((bool)row["IsReadPermit"]),
                    Edit = Convert.ToBoolean((bool)row["Edit"]),
                });
                return await Task.FromResult(result);
            }
        }
        public async Task<AccountRoleModel> GetOneModelByRowID(int RowID)
        {
            DataTable dt = new DataTable();
            SqlConditions Conds = new SqlConditions();
            Conds.Add("RowID", RowID);
            string sql = @"select * from AccountList where RowID = @RowID";
            using (DpsConnection cnn = new DpsConnection(_connectionString))
            {
                dt = await cnn.CreateDataTableAsync(sql, Conds);
                string Username = dt.Rows[0]["Username"].ToString();
                string Password = DpsLibs.Common.EncDec.Decrypt(dt.Rows[0]["Password"].ToString(), Constant.PASSWORD_ED);
                var result = dt.AsEnumerable().Select(row => new AccountRoleModel
                {
                    Gender = row["Gender"].ToString(),
                    Fullname = row["Fullname"].ToString(),
                    Email = row["Email"].ToString(),
                    Mobile = row["Mobile"].ToString(),
                    Note = row["Note"].ToString(),
                    PartnerId = Int32.Parse(row["PartnerId"].ToString()),
                    RowId = Int32.Parse(row["RowID"].ToString()),
                    Username = Username,
                    Password = Password
                }).SingleOrDefault();
                return await Task.FromResult(result);
            }
        }

        public async Task<ReturnSqlModel> UpdateAccount(AccountRoleModel model, long CreatedBy)
        {
            Hashtable val = new Hashtable();
            SqlConditions conds = new SqlConditions();
            using (DpsConnection cnn = new DpsConnection(_connectionString))
            {
                try
                {
                    conds.Add("RowID", model.RowId);
                    val = InitDataAccount(model, CreatedBy, true);
                    int x = cnn.Update(val, conds, "AccountList");
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
        public async Task<string> GetNoteLock(long RowID)
        {
            DataTable dt = new DataTable();
            SqlConditions conds = new SqlConditions();
            conds.Add("RowID", RowID);
            string result = "";
            using (DpsConnection cnn = new DpsConnection(_connectionString))
            {
                string sql = "select LockedNote, UnlockedNote, IsLock from AccountList where RowID = @RowID";
                dt = await cnn.CreateDataTableAsync(sql, conds);
                bool isLock = (bool)dt.Rows[0]["IsLock"];
                if (isLock)
                {
                    result = dt.Rows[0]["UnlockedNote"].ToString();
                }
                else
                {
                    result = dt.Rows[0]["LockedNote"].ToString();
                }
                return await Task.FromResult(result);
            }
        }
        public async Task<ReturnSqlModel> UpdateStatusAccount(AccountRoleStatusModel model, long CreatedBy)
        {
            Hashtable val = new Hashtable();
            SqlConditions conds = new SqlConditions();
            using (DpsConnection cnn = new DpsConnection(_connectionString))
            {
                try
                {
                    conds.Add("RowID", model.RowID);
                    if (model.IsLock)
                    {
                        val.Add("IsLock", 0);
                        val.Add("UnlockedNote", model.Note);
                        val.Add("UnlockedBy", CreatedBy);
                        val.Add("UnlockedDate", DateTime.UtcNow);
                    }
                    else
                    {
                        val.Add("IsLock", 1);
                        val.Add("LockedNote", model.Note);
                        val.Add("LockedBy", CreatedBy);
                        val.Add("LockedDate", DateTime.UtcNow);
                    }
                    int x = cnn.Update(val, conds, "AccountList");
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
        private  int CheclAccountPermit(DpsConnection cnn,AccountRole model)
        {
            DataTable dt = new DataTable();
            SqlConditions Conds = new SqlConditions();
            Conds.Add("Username", model.Username);
            Conds.Add("Id_Permit", model.Id_Permit);
            string sql = @"SELECT tbl_permision.Id_Permit, tbl_permision.Tenquyen, tbl_account_permit.Edit 
						FROM tbl_permision, tbl_account_permit 
						where tbl_permision.Id_permit = tbl_account_permit.Id_Permit 
						AND Username = @Username and tbl_permision.Id_Permit = @Id_Permit;";
            using (cnn = new DpsConnection(_connectionString))
            {
                dt = cnn.CreateDataTable(sql, Conds);
                if (dt != null && dt.Rows.Count > 0)
                {
                    return 1; 
                }
                else
                {
                    return 0; 
                }
            }
        }
        private void UpdateEditRole(DpsConnection cnn, AccountRole model)
        {
            Hashtable val = new Hashtable();
            SqlConditions conds = new SqlConditions();
            using ( cnn = new DpsConnection(_connectionString))
            {
                try
                {
                    conds.Add("Username", model.Username);
                    conds.Add("Id_Permit", model.Id_Permit);
                    val.Add("Edit", model.Edit);
    
                    int x = cnn.Update(val, conds, "tbl_account_permit");
                    if (x <= 0)
                    {
                        throw cnn.LastError;
                    }
                }
                catch (Exception ex)
                {
                    cnn.RollbackTransaction();
                    cnn.EndTransaction();
                    throw cnn.LastError;
                }
            }
        }
        private void CreateAccountPermission(DpsConnection cnn, AccountRole model)
        {
            using (cnn = new DpsConnection(_connectionString))
            {
                try
                {
                    var val = InitDataAccountPermision(model);
                    int x = cnn.Insert(val, "tbl_account_permit");
                    if (x <= 0)
                    {
                        throw cnn.LastError;
                    }
                }
                catch (Exception ex)
                {
                    throw cnn.LastError;
                }
            }
        }
        private Hashtable InitDataAccountPermision(AccountRole account)
        {
            Hashtable val = new Hashtable();
            val.Add("Id_Permit", account.Id_Permit);
            val.Add("Username", account.Username);
            val.Add("Edit", account.Edit);
            val.Add("Id_chucnang", 0);
            return val;

        }
        public void UpdateInsertEditRole(DpsConnection cnn, AccountRole account)
        {
            try
            {
                if(CheclAccountPermit(cnn,account)==0) 
                {
                    CreateAccountPermission(cnn, account);
                }
                else 
                {
                    UpdateEditRole(cnn, account);
                }
                
            }
            catch (Exception)
            {
                throw;
            }
        }
        //public async Task<object> Save_QuyenNguoiDung(List<AccountRole> arr_data)
        //{

        //    SqlConditions conds;
        //    Hashtable val = new Hashtable();
        //    List<string> permit = new List<string>();
        //    List<string> ReadOnlyPermit = new List<string>();
        //    try
        //    {
        //        using (DpsConnection cnn = new DpsConnection(_connectionString))
        //        {
        //            conds = new SqlConditions();
        //            conds.Add("Username", arr_data[0].Username);
        //            DataTable dt = cnn.CreateDataTable($@"select Id_Permit, Edit from tbl_Account_Permit where (where)", "(where)", conds);
        //            string status = $@"select Id_Permit, Edit from Tbl_Account_Permit where Username='" + arr_data[0].Username + "'";
        //            foreach (AccountRole data in arr_data)
        //            {
        //                DataRow[] drow = dt.Select("Id_Permit=" + data.Id_Permit);
        //                if (data.Edit)
        //                {
        //                    permit.Add(data.Id_Permit.ToString());
        //                }
        //                else
        //                {
        //                }
        //            }
        //            conds = new SqlConditions();
        //            conds.Add("Username", arr_data[0].Username);
        //            conds.Add("id_chucnang", 0);
        //            //string cmd = $@"delete Tbl_Account_permit 
        //            //            where (Username=@Username) and (Id_Permit in (select Id_Permit 
        //            //            from tbl_permision where Id_group=@id_chucnang))";
        //            //int rs = cnn.ExecuteNonQuery(cmd, conds);
        //            //if (rs == -1)
        //            //{
        //            //    return JsonResultCommon.Exception(cnn.LastError);
        //            //}
        //            for (int i = 0; i < permit.Count; i++)
        //            {
        //                val = new Hashtable();
        //                val.Add("Username", arr_data[0].Username);
        //                val.Add("Id_Permit", permit[i]);
        //                bool edit = true;
        //                if (ReadOnlyPermit.Contains(permit[i])) edit = false;
        //                val.Add("Edit", edit);
        //                val.Add("id_chucnang", 0);
        //                if (cnn.Insert(val, "Tbl_Account_permit") == -1)
        //                {
        //                    return JsonResultCommon.Exception(cnn.LastError);
        //                }
        //            }
        //            cnn.EndTransaction();
        //            cnn.Disconnect();
        //        }
        //        return await Task.FromResult(val);
        //    }
        //    catch (Exception ex)
        //    {
        //        return JsonResultCommon.Exception(ex);
        //    }
        //}
        //public async Task<object> Save_QuyenNguoiDung(List<AccountRole> arr_data)
        //{

        //    SqlConditions conds = new SqlConditions();
        //    Hashtable val = new Hashtable();
        //    List<string> permit = new List<string>();
        //    List<string> ReadOnlyPermit = new List<string>();
        //    try
        //    {
        //        using (DpsConnection cnn = new DpsConnection(_connectionString))
        //        {
        //            foreach (AccountRole data in arr_data)
        //            {
        //                if (CheclAccountPermit(cnn, data) == 0)
        //                {
        //                    CreateAccountPermission(cnn, data);
        //                }
        //                else
        //                {
        //                    UpdateEditRole(cnn, data);
        //                }
        //            }

        //            cnn.EndTransaction();
        //            cnn.Disconnect();
        //        }
        //        return JsonResultCommon.ThanhCong();
        //    }
        //    catch (Exception ex)
        //    {

        //        return JsonResultCommon.Exception(ex);
        //    }
        //}
        //public async Task<object> Save_QuyenNguoiDung(List<AccountRole> arr_data)
        //{

        //    SqlConditions conds = new SqlConditions();
        //    Hashtable val = new Hashtable();
        //    List<string> permit = new List<string>();
        //    List<string> ReadOnlyPermit = new List<string>();
        //    try
        //    {
        //        using (DpsConnection cnn = new DpsConnection(_connectionString))
        //        {
        //            conds = new SqlConditions();
        //            conds.Add("Username", arr_data[0].Username);
        //            DataTable dt = cnn.CreateDataTable($@"select Id_Permit, Edit from tbl_Account_Permit where (where)", "(where)", conds);
        //            string status = $@"select Id_Permit, Edit from Tbl_Account_Permit where Username='" + arr_data[0].Username + "'";
        //            foreach (AccountRole data in arr_data)
        //            {
        //                DataRow[] drow = dt.Select("Id_Permit=" + data.Id_Permit);
        //                if (data.Edit)
        //                {
        //                    permit.Add(data.Id_Permit.ToString());
        //                    bool chixem = data.IsRead;
        //                    if (data.IsRead)
        //                    {
        //                        ReadOnlyPermit.Add(data.Id_Permit.ToString());
        //                    }
        //                    else if (drow[0]["Edit"].ToString().ToLower().Equals(chixem.ToString().ToLower()))
        //                    {
        //                    }
        //                }
        //                else
        //                {
        //                }
        //            }
        //            conds = new SqlConditions();
        //            conds.Add("Username", arr_data[0].Username);
        //            conds.Add("Id_Permit", arr_data[0].Id_Permit);
        //            //string cmd = $@"delete Tbl_Account_permit 
        //            //            where (username=@username) and (id_permit in (select Id_Permit 
        //            //            from tbl_permision where Id_group=@Id_chucnang))";
        //            string cmd = $@"DELETE FROM Tbl_Account_permit WHERE (username = @username AND id_permit = @id_permit)";
        //            int rs = cnn.ExecuteNonQuery(cmd, conds);
        //            if (rs == -1)
        //            {
        //                return JsonResultCommon.Exception(cnn.LastError);
        //            }
        //            for (int i = 0; i < permit.Count; i++)
        //            {
        //                val = new Hashtable();
        //                val.Add("Username", arr_data[0].Username);
        //                val.Add("Id_Permit", permit[i]);
        //                bool edit = true;
        //                if (ReadOnlyPermit.Contains(permit[i])) edit = false;
        //                val.Add("Edit", edit);
        //                val.Add("Id_chucnang", 0);
        //                int x = cnn.Insert(val, "tbl_account_permit");
        //                if (x <= 0)
        //                {
        //                    throw cnn.LastError;
        //                }
        //                if (cnn.Insert(val, "Tbl_Account_permit") == -1)
        //                {
        //                    return JsonResultCommon.Exception(cnn.LastError);
        //                }
        //            }
        //            cnn.EndTransaction();
        //            cnn.Disconnect();
        //        }
        //        return JsonResultCommon.ThanhCong();
        //    }
        //    catch (Exception ex)
        //    {

        //        return JsonResultCommon.Exception(ex);
        //    }
        //}
        public async Task<object> Save_QuyenNguoiDung(List<AccountRole> arr_data)
        {

            SqlConditions conds = new SqlConditions();
            Hashtable val = new Hashtable();
            List<string> permit = new List<string>();
            List<string> ReadOnlyPermit = new List<string>();
            try
            {
                using (DpsConnection cnn = new DpsConnection(_connectionString))
                {
                    conds = new SqlConditions();

                     string tableName = "tbl_account_permit";
                     string   ColumnKey = "Username";

                    conds.Add(ColumnKey, arr_data[0].Username);
                    DataTable dt = cnn.CreateDataTable("select id_permit, Edit " +
                        "from " + tableName + " " +
                        "where (where)", "(where)", conds);
                    string them = "", xoa = "", capnhat = "";
                    string LogContent = "";
                    foreach (AccountRole data in arr_data)
                    {
                        DataRow[] drow = dt.Select("id_permit=" + data.Id_Permit);
                        if (data.Edit)
                        {
                            permit.Add(data.Id_Permit.ToString());
                            bool chixem = data.IsReadPermit;
                            if (data.IsReadPermit)
                            {
                                ReadOnlyPermit.Add(data.Id_Permit.ToString());
                            }
                            if (drow.Length <= 0) them += ", " + data.Tenquyen + "(" + data.Id_Permit + ")" + (chixem ? " <Chỉ xem>" : "");
                            else if (drow[0]["edit"].ToString().ToLower().Equals(chixem.ToString().ToLower())) capnhat += ", " + data.Tenquyen + "(" + data.Id_Permit + ")" + (chixem ? "<Cho phép chỉnh sửa>-> <Chỉ xem>" : "<Chỉ xem>-><Cho phép chỉnh sửa>");
                        }
                        else
                        {
                            if (drow.Length > 0) xoa = ", " + data.Tenquyen + "(" + data.Id_Permit + ")";
                        }
                    }
                    if (them.Length > 0) LogContent += " Thêm quyền : " + them.Substring(1);
                    if (capnhat.Length > 0) LogContent += " | Chỉnh sửa quyền : " + capnhat.Substring(1);
                    if (xoa.Length > 0) LogContent += " | Xóa quyền : " + xoa.Substring(1);

                    conds = new SqlConditions();
                    conds.Add(ColumnKey, arr_data[0].Username);
                    conds.Add("id_chucnang", 1);
                    string execute = "delete " + tableName + " where (" + ColumnKey + "=@" + ColumnKey + ") " +
                            "and (id_permit in (select Id_Permit from tbl_permision))" +
                            "";
                    int rs = cnn.ExecuteNonQuery(execute, conds);
                    if (rs == -1)
                    {
                        return JsonResultCommon.Exception(cnn.LastError);
                    }
                    for (int i = 0; i < permit.Count; i++)
                    {
                        val = new Hashtable();
                        val.Add(ColumnKey, arr_data[0].Username);
                        val.Add("id_permit", permit[i]);
                        bool edit = true;
                        if (ReadOnlyPermit.Contains(permit[i])) edit = false;
                        val.Add("edit", edit);
                        val.Add("id_chucnang", 1);
                        if (cnn.Insert(val, tableName) == -1)
                        {
                            return JsonResultCommon.Exception(cnn.LastError);
                        }
                     }
                    //LogContent += " của nhóm " + arr_data[0].Ten + "(" + arr_data[0].ID + ")";
                    cnn.EndTransaction();
                    cnn.Disconnect();
                }
                return JsonResultCommon.ThanhCong();
            }
            catch (Exception ex)
            {

                return JsonResultCommon.Exception(ex);
            }
        }
    }
}