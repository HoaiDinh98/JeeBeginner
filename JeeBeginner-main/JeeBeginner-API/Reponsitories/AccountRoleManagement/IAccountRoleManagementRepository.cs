using DpsLibs.Data;
using JeeBeginner.Models.AccountRoleManagement;
using JeeBeginner.Models.Common;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace JeeBeginner.Reponsitories.AccountRoleManagement
{
    public interface IAccountRoleManagementRepository
    {
        Task<IEnumerable<AccountRoleDTO>> GetAll(SqlConditions conds, string orderByStr);
        Task<IEnumerable<AccountRoleDTO>> GetAllAccounts(SqlConditions conds, string orderByStr);
        Task<IEnumerable<AccountRole>> GetAllRole(string Username);
        Task<IEnumerable<AccountRole>> GetRoleById(string Username);
        Task<string> GetNoteLock(long RowID);
        Task<AccountRoleModel> GetOneModelByRowID(int RowID);
        Task<ReturnSqlModel> CreateAccount(AccountRoleModel model, long CreatedBy);
        Task<ReturnSqlModel> UpdateAccount(AccountRoleModel model, long CreatedBy);
        Task<ReturnSqlModel> UpdateStatusAccount(AccountRoleStatusModel model, long CreatedBy);
        Task<object> Save_QuyenNguoiDung(List<AccountRole> arr_data);
        void UpdateInsertEditRole(DpsConnection cnn, AccountRole account);
    }
}