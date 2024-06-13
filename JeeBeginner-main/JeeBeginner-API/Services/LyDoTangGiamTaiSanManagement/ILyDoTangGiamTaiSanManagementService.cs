using DpsLibs.Data;
using JeeBeginner.Models.Common;
using JeeBeginner.Models.LyDoTangGiamTaiSanManagement;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace JeeBeginner.Services.LyDoTangGiamTaiSanManagement
{
    public interface ILyDoTangGiamTaiSanManagementService
    {
        Task<IEnumerable<LyDoTangGiamTaiSanModel>> GetAll(SqlConditions conds, string orderByStr, string whereStr);
        Task<LyDoTangGiamTaiSanModel> GetOneModelByRowID(int IdLyDoTangGiamTaiSan);
        Task<ReturnSqlModel> CreateLyDoTangGiamTaiSan(LyDoTangGiamTaiSanModel model, long CreatedBy);
        Task<ReturnSqlModel> UpdateLyDoTangGiamTaiSan(LyDoTangGiamTaiSanModel model, long CreatedBy);
        Task<ReturnSqlModel> UpdateStatusLyDoTangGiamTaiSan(LyDoTangGiamTaiSanModel model, long DeleteBy);
        Task<ReturnSqlModel> Delete(LyDoTangGiamTaiSanModel model, long DeleteBy);
        Task<ReturnSqlModel> Deletes(decimal[] ids, long DeleteBy);
    }
}
