using DpsLibs.Data;
using JeeBeginner.Models.AccountRoleManagement;
using JeeBeginner.Models.Common;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace JeeBeginner.Services.AccountRoleManagement
{
    public interface IAccountRoleManagementService
    {
        Task<IEnumerable<AccountRoleDTO>> GetAll(SqlConditions conds, string orderByStr);
        Task<IEnumerable<AccountRoleDTO>> GetAllAccounts(SqlConditions conds, string orderByStr);
        Task<IEnumerable<AccountRole>> GetAllRole(string Username);
        Task<IEnumerable<AccountRole>> GetRoleById(string Username);

        Task<ReturnSqlModel> CreateAccount(AccountRoleModel account, long CreatedBy);

        Task<ReturnSqlModel> UpdateAccount(AccountRoleModel accountModel, long CreatedBy);

        Task<AccountRoleModel> GetOneModelByRowID(int RowID);

        Task<string> GetNoteLock(long RowID);

        Task<ReturnSqlModel> UpdateStatusAccount(AccountRoleStatusModel model, long CreatedBy);
        Task UpdateInsertEditRole(AccountRole account);
        Task<object> Save_QuyenNguoiDung(List<AccountRole> arr_data);
    }
}