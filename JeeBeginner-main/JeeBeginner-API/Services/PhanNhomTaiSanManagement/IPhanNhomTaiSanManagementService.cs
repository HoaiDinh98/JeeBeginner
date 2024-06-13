using DpsLibs.Data;
using JeeBeginner.Models.Common;
using JeeBeginner.Models.PhanNhomTaiSanManagement;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace JeeBeginner.Services.PhanNhomTaiSanManagement
{
    public interface IPhanNhomTaiSanManagementService
    {
        Task<IEnumerable<PhanNhomTaiSanModel>> GetAll(SqlConditions conds, string orderByStr, string whereStr);
        Task<PhanNhomTaiSanModel> GetOneModelByRowID(int IdPhanNhomTaiSan);
        Task<ReturnSqlModel> CreatePhanNhomTaiSan(PhanNhomTaiSanModel model, long CreatedBy);
        Task<ReturnSqlModel> UpdatePhanNhomTaiSan(PhanNhomTaiSanModel model, long CreatedBy);
        Task<ReturnSqlModel> UpdateStatusPhanNhomTaiSan(PhanNhomTaiSanModel model, long DeleteBy);
        Task<ReturnSqlModel> Delete(PhanNhomTaiSanModel model, long DeleteBy);
        Task<ReturnSqlModel> Deletes(decimal[] ids, long DeleteBy);
    }
}
