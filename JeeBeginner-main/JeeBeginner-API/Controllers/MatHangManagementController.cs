using DpsLibs.Data;
using JeeBeginner.Classes;
using JeeBeginner.Models.Common;
using JeeBeginner.Services.Authorization;
using JeeBeginner.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using static JeeBeginner.Models.Common.Panigator;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using JeeBeginner.Services.MatHangManagement;
using Microsoft.AspNetCore.Cors;
using System.Linq;
using JeeBeginner.Models.MatHangManagement;
using JeeBeginner.Models.XuatXuManagement;
using static Microsoft.Extensions.Logging.EventSource.LoggingEventSource;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.IO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;

namespace JeeBeginner.Controllers
{
    [EnableCors("AllowOrigin")]
    [Route("api/MatHangmanagement")]
    [ApiController]
    public class MatHangManagementController : ControllerBase
    {
        private readonly IWebHostEnvironment _hostingEnvironment;
        private readonly IMatHangManagementService _service;
        private readonly ICustomAuthorizationService _authService;
        private readonly IConfiguration _configuration;
        private readonly string _connectionString;
        private readonly string _jwtSecret;

        public MatHangManagementController(IMatHangManagementService MatHangManagementService, IConfiguration configuration, ICustomAuthorizationService authService, IWebHostEnvironment hostingEnvironment)
        {

            _service = MatHangManagementService;
            _configuration = configuration;
            _hostingEnvironment = hostingEnvironment;
            _authService = authService;
            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _jwtSecret = configuration.GetValue<string>("JWT:Secret");
        }

        //[HttpPost("MatHangList")]
        //public async Task<object> GetListDS_MatHang([FromBody] QueryRequestParams query)
        //{
        //    try
        //    {
        //        var user = Ulities.GetUserByHeader(HttpContext.Request.Headers, _jwtSecret);
        //        if (user is null) return JsonResultCommon.BatBuoc("Đăng nhập");

        //        query = query == null ? new QueryRequestParams() : query;
        //        BaseModel<object> model = new BaseModel<object>();
        //        PageModel pageModel = new PageModel();
        //        ErrorModel error = new ErrorModel();
        //        SqlConditions conds = new SqlConditions();
        //        string orderByStr = " TenMatHang  asc";
        //        string whereStr = "";
        //        conds.Add("PartnerList.IsLock", 0);
        //        string partnerID = GeneralService.GetObjectDB($"select PartnerID from AccountList where RowID = {user.Id}", _connectionString).ToString();
        //        if (user.IsMasterAccount)
        //        {
        //        }
        //        else
        //        {
        //            conds.Add("AccountList.IsLock", partnerID);
        //        }


        //        Dictionary<string, string> _sortableFields = new Dictionary<string, string>
        //            {
        //                { "TenMatHang ", "TenMatHang "},
        //                 { "MaLMH", "MaLMH"},
        //                { "IdMH Parent", "IdMH Parent"},
        //                 { "TenMatHang ", "TenMatHang "},
        //                     { "TenMatHang Parent", "TenMatHang Parent"},
        //                { "MaHang ", "MaHang "},
        //                { "SoKyTinhKhauHaoToiDa", "SoKyTinhKhauHaoToiDa"},
        //            };

        //        if (query.Sort != null)
        //        {
        //            if (!string.IsNullOrEmpty(query.Sort.ColumnName) && _sortableFields.ContainsKey(query.Sort.ColumnName))
        //            {
        //                orderByStr = _sortableFields[query.Sort.ColumnName] + " " + (query.Sort.Direction.Equals("asc", StringComparison.OrdinalIgnoreCase) ? "asc" : "desc");
        //            }
        //        }
        //        //if (!string.IsNullOrEmpty(query.Filter["keyword"]))
        //        //{
        //        //    whereStr += @" and (TenMatHang  like @kw )";
        //        //    conds.Add("kw", "%" + query.Filter["keyword"].Trim() + "%");
        //        //}
        //        //if (query.Filter != null)
        //        //{
        //        //    if (query.Filter.ContainsKey("keyword"))
        //        //    {
        //        //        var keyword = query.Filter["keyword"];
        //        //        if (!string.IsNullOrEmpty(query.Filter["keyword"]))
        //        //        {
        //        //            whereStr += @" and (TenMatHang  like @kw )";
        //        //            conds.Add("kw", "%" + query.Filter["keyword"].Trim() + "%");
        //        //        }
        //        //    }
        //        //    if (query.Filter.ContainsKey("TenMatHang "))
        //        //    {
        //        //        if (!string.IsNullOrEmpty(query.Filter["TenMatHang "]))
        //        //        {
        //        //            whereStr += $@" and (TenMatHang  like N'%{query.Filter["TenMatHang "].Trim()}%')";
        //        //        }
        //        //    }
        //        //    if (query.Filter.ContainsKey("MaHang "))
        //        //    {
        //        //        if (!string.IsNullOrEmpty(query.Filter["MaHang "]))
        //        //        {
        //        //            whereStr += $@" and (MaHang  like '%{query.Filter["MaHang "].Trim()}%')";
        //        //        }
        //        //    }
        //        //    if (query.Filter.ContainsKey("TenMatHang Parent"))
        //        //    {
        //        //        if (!string.IsNullOrEmpty(query.Filter["TenMatHang Parent"]))
        //        //        {
        //        //            whereStr += $@" and (TenMatHang Parent like N'%{query.Filter["TenMatHang Parent"].Trim()}%')";
        //        //        }
        //        //    }
        //        //}




        //        bool Visible = true;
        //        Visible = !_authService.IsReadOnlyPermit("1", user.Username);
        //        var customerlist = await _service.GetAll(conds, orderByStr, whereStr);
        //        if (customerlist.Count() == 0)
        //            return JsonResultCommon.ThatBai("Không có dữ liệu");
        //        if (customerlist is null)
        //            return JsonResultCommon.KhongTonTai();


        //        pageModel.TotalCount = customerlist.Count();
        //        pageModel.AllPage = (int)Math.Ceiling(customerlist.Count() / (decimal)query.Panigator.PageSize);
        //        pageModel.Size = query.Panigator.PageSize;
        //        pageModel.Page = query.Panigator.PageIndex;
        //        customerlist = customerlist.AsEnumerable().Skip((query.Panigator.PageIndex - 1) * query.Panigator.PageSize).Take(query.Panigator.PageSize);
        //        return JsonResultCommon.ThanhCong(customerlist, pageModel, Visible);
        //    }
        //    catch (Exception ex)
        //    {
        //        return JsonResultCommon.Exception(ex);
        //    }
        //}

        [HttpPost("MatHangList")]
        public async Task<object> GetListDS_MatHang([FromQuery] QueryParams query)
        {
            try
            {
                var user = Ulities.GetUserByHeader(HttpContext.Request.Headers, _jwtSecret);
                if (user is null) return JsonResultCommon.BatBuoc("Đăng nhập");

                query = query == null ? new QueryParams() : query;
                BaseModel<object> model = new BaseModel<object>();
                Models.Common.PageModel pageModel = new Models.Common.PageModel();
                ErrorModel error = new ErrorModel();
                SqlConditions conds = new SqlConditions();
                string orderByStr = "IdMH  asc";
                string whereStr = "";
                //conds.Add("DM_MatHang.isDel", 0);
                //string partnerID = GeneralService.GetObjectDB($"select IdMH  from DM_MatHang where IdMH  = {user.Id}", _connectionString).ToString();
                if (user.IsMasterAccount)
                {
                }
                Dictionary<string, string> filter = new Dictionary<string, string>
                 {
                     {"stt", "IdMH" },
                     { "tenmathang", "TenMatHang "},
                     { "mahang", "MaHang "},
                     { "SoKyTinhKhauHaoToiThieu", "SoKyTinhKhauHaoToiThieu"},
                     {"SoKyTinhKhauHaoToiDa", "SoKyTinhKhauHaoToiDa" },
                 };
                if (query.sortField != null)
                {
                    if (!string.IsNullOrEmpty(query.sortField) && filter.ContainsKey(query.sortField))
                    {
                        ///abc
                        orderByStr = filter[query.sortField] + " " + (query.sortField.Equals("asc", StringComparison.OrdinalIgnoreCase) ? "asc" : "desc");
                    }
                }

                if (query.filter != null)
                {
                    if (!string.IsNullOrEmpty(query.filter["keyword"]))
                    {
                        whereStr += $" and (TenMatHang LIKE '%{query.filter["keyword"]}%' OR MaHang LIKE N'%{query.filter["keyword"]}%')";
                    }
                    //var keyword = query.filter["keyword"];
                    //if (!string.IsNullOrEmpty(query.filter["keyword"]))
                    //{
                    //    whereStr += @" and (TenMatHang  like @kw )";
                    //    conds.Add("kw", "%" + query.filter["keyword"].Trim() + "%");
                    //}
                    if (!string.IsNullOrEmpty(query.filter["IdLMH"]))
                    {
                        whereStr += $@" and IdLMH IN ({query.filter["IdLMH"]})";
                    }
                    if (!string.IsNullOrEmpty(query.filter["IdDVT"]))
                    {
                        whereStr += $@" and IdDVT IN ({query.filter["IdDVT"]})";
                    }
                    if (!string.IsNullOrEmpty(query.filter["IdNhanHieu"]))
                    {
                        whereStr += $@" and IdNhanHieu IN ({query.filter["IdNhanHieu"]})";
                    }
                    if (!string.IsNullOrEmpty(query.filter["IdXuatXu"]))
                    {
                        whereStr += $@" and IdXuatXu IN ({query.filter["IdXuatXu"]})";
                    }

                    if (!string.IsNullOrEmpty(query.filter["TenMatHang"]))
                        {
                            whereStr += $@" and (TenMatHang  like N'%{query.filter["TenMatHang "].Trim()}%')";
                        }
                        if (!string.IsNullOrEmpty(query.filter["MaHang"]))
                        {
                            whereStr += $@" and (MaHang  like '%{query.filter["MaHang "].Trim()}%')";
                        }


                }

                bool Visible = true;
                Visible = !_authService.IsReadOnlyPermit("3900", user.Username);
                var customerlist = await _service.GetAll(conds, orderByStr, whereStr);
                if (customerlist.Count() == 0)
                    return JsonResultCommon.ThatBai("Không có dữ liệu");
                if (customerlist is null)
                    return JsonResultCommon.KhongTonTai();
                int total = customerlist.Count();
                //pageModel.TotalCount = customerlist.Count();
                //pageModel.AllPage = (int)Math.Ceiling(total / (decimal)query.record);
                //pageModel.Size = query.record;
                //pageModel.Page = query.page;
                //customerlist = customerlist.AsEnumerable().Skip((query.Panigator.PageIndex - 1) * query.Panigator.PageSize).Take(query.Panigator.PageSize);
                //return JsonResultCommon.ThanhCong(customerlist , pageModel , Visible);



                pageModel.TotalCount = customerlist.Count();
                pageModel.AllPage = (int)Math.Ceiling(customerlist.Count() / (decimal)query.record);
                //pageModel.AllPage = (int)Math.Ceiling(customerlist.Count() / (decimal)query.Panigator.PageSize);
                pageModel.Size = query.record;
                pageModel.Page = query.page;
                if (query.more)
                {
                    query.page = 0;
                    query.record = pageModel.TotalCount;
                }
                //pageModel.Size = query.Panigator.PageSize;
                //pageModel.Page = query.Panigator.PageIndex;
                customerlist = customerlist.AsEnumerable().Skip((query.page - 1) * query.record).Take(query.record);
                return JsonResultCommon.ThanhCong(customerlist, pageModel, Visible);
            }
            catch (Exception ex)
            {
                return JsonResultCommon.Exception(ex);
            }
        }
        [HttpPost("create-MatHang")]
        public async Task<object> CreateMatHang(MatHangModel model)
        {
            try
            {
                var user = Ulities.GetUserByHeader(HttpContext.Request.Headers, _jwtSecret);
                if (user is null) return JsonResultCommon.BatBuoc("Đăng nhập");
                var create = await _service.CreateMatHang(model, user.Id);

                if (!create.Susscess)
                {
                    return JsonResultCommon.ThatBai(create.ErrorMessgage);
                }

                return JsonResultCommon.ThanhCong(model);
            }
            catch (Exception ex)
            {
                return JsonResultCommon.Exception(ex);
            }
        }

        [HttpPost("update-MatHang")]
        public async Task<object> UpdateMatHang(MatHangModel model)
        {
            try
            {
                var user = Ulities.GetUserByHeader(HttpContext.Request.Headers, _jwtSecret);
                if (user is null) return JsonResultCommon.BatBuoc("Đăng nhập");

                //string sqlCheckCode = $"select IdMH  from DM_MatHang where IdMH  = {model.IdMH }";
                //bool isExist = GeneralService.IsExistDB(sqlCheckCode, _connectionString);
                //if (!isExist)
                //    if (!isExist) return JsonResultCommon.KhongTonTai("Loại mặt hàng");

                var update = await _service.UpdateMatHang(model, user.Id);
                if (!update.Susscess)
                {
                    return JsonResultCommon.ThatBai(update.ErrorMessgage);
                }
                return JsonResultCommon.ThanhCong(model);
            }
            catch (Exception ex)
            {
                return JsonResultCommon.Exception(ex);
            }
        }

        [HttpGet("GetMatHangByRowID")]
        public async Task<object> GetTaiKhoanByRowID(int RowID)
        {
            try
            {
                var user = Ulities.GetUserByHeader(HttpContext.Request.Headers, _jwtSecret);
                if (user is null) return JsonResultCommon.BatBuoc("Đăng nhập");

                var create = await _service.GetOneModelByRowID(RowID);
                //if (create.IdMH  == 0)
                //{
                //    return JsonResultCommon.KhongTonTai("Loại mặt hàng");
                //}

                return JsonResultCommon.ThanhCong(create);
            }
            catch (Exception ex)
            {
                return JsonResultCommon.Exception(ex);
            }
        }
        [HttpGet("GetKhoID")]
        public async Task<object> GetKhoID(int IdK)
        {
            try
            {
                var user = Ulities.GetUserByHeader(HttpContext.Request.Headers, _jwtSecret);
                if (user is null) return JsonResultCommon.BatBuoc("Đăng nhập");

                var create = await _service.GetKhoID(IdK);
                if (create.MaLuuKho == 0)
                {
                    return JsonResultCommon.KhongTonTai("Loại mặt hàng");
                }

                return JsonResultCommon.ThanhCong(create);
            }
            catch (Exception ex)
            {
                return JsonResultCommon.Exception(ex);
            }
        }
        //[HttpGet("GetLoaiMHChaID")]
        //public async Task<object> GetLoaiMHChaID(int IdMH Parent)
        //{
        //    try
        //    {
        //        var user = Ulities.GetUserByHeader(HttpContext.Request.Headers, _jwtSecret);
        //        if (user is null) return JsonResultCommon.BatBuoc("Đăng nhập");

        //        var create = await _service.GetLoaiMHChaID(IdMH Parent);
        //        if (create.IdMH Parent == 0)
        //        {
        //            return JsonResultCommon.KhongTonTai("Loại mặt hàng");
        //        }

        //        return JsonResultCommon.ThanhCong(create);
        //    }
        //    catch (Exception ex)
        //    {
        //        return JsonResultCommon.Exception(ex);
        //    }
        //}
        [HttpGet("DM_Kho_List")]
        public async Task<object> DM_Kho_List()
        {
            try
            {
                var user = Ulities.GetUserByHeader(HttpContext.Request.Headers, _jwtSecret);
                if (user is null) return JsonResultCommon.BatBuoc("Đăng nhập");

                var dmKholist = await _service.DM_Kho_List();
                if (dmKholist.Count() == 0)
                    return JsonResultCommon.ThatBai("Không có dữ liệu");
                if (dmKholist is null)
                    return JsonResultCommon.KhongTonTai();
                return JsonResultCommon.ThanhCong(dmKholist);
            }
            catch (Exception ex)
            {
                return JsonResultCommon.Exception(ex);
            }
        }
        [HttpGet("DM_XuatXu_List")]
        public async Task<object> DM_XuatXu_List()
        {
            try
            {
                var user = Ulities.GetUserByHeader(HttpContext.Request.Headers, _jwtSecret);
                if (user is null) return JsonResultCommon.BatBuoc("Đăng nhập");

                var dmKholist = await _service.DM_XuatXu_List();
                if (dmKholist.Count() == 0)
                    return JsonResultCommon.ThatBai("Không có dữ liệu");
                if (dmKholist is null)
                    return JsonResultCommon.KhongTonTai();
                return JsonResultCommon.ThanhCong(dmKholist);
            }
            catch (Exception ex)
            {
                return JsonResultCommon.Exception(ex);
            }
        }
        [HttpGet("DM_NhanHieu_List")]
        public async Task<object> DM_NhanHieu_List()
        {
            try
            {
                var user = Ulities.GetUserByHeader(HttpContext.Request.Headers, _jwtSecret);
                if (user is null) return JsonResultCommon.BatBuoc("Đăng nhập");

                var dmKholist = await _service.DM_NhanHieu_List();
                if (dmKholist.Count() == 0)
                    return JsonResultCommon.ThatBai("Không có dữ liệu");
                if (dmKholist is null)
                    return JsonResultCommon.KhongTonTai();
                return JsonResultCommon.ThanhCong(dmKholist);
            }
            catch (Exception ex)
            {
                return JsonResultCommon.Exception(ex);
            }
        }
        [HttpGet("DM_LoaiMatHang_List")]
        public async Task<object> DM_LoaiMatHang_List()
        {
            try
            {
                var user = Ulities.GetUserByHeader(HttpContext.Request.Headers, _jwtSecret);
                if (user is null) return JsonResultCommon.BatBuoc("Đăng nhập");

                var dmKholist = await _service.DM_LoaiMatHang_List();
                if (dmKholist.Count() == 0)
                    return JsonResultCommon.ThatBai("Không có dữ liệu");
                if (dmKholist is null)
                    return JsonResultCommon.KhongTonTai();
                return JsonResultCommon.ThanhCong(dmKholist);
            }
            catch (Exception ex)
            {
                return JsonResultCommon.Exception(ex);
            }
        }
        [HttpGet("DM_DVT_List")]
        public async Task<object> DM_DVT_List()
        {
            try
            {
                var user = Ulities.GetUserByHeader(HttpContext.Request.Headers, _jwtSecret);
                if (user is null) return JsonResultCommon.BatBuoc("Đăng nhập");

                var dmKholist = await _service.DM_DVT_List();
                if (dmKholist.Count() == 0)
                    return JsonResultCommon.ThatBai("Không có dữ liệu");
                if (dmKholist is null)
                    return JsonResultCommon.KhongTonTai();
                return JsonResultCommon.ThanhCong(dmKholist);
            }
            catch (Exception ex)
            {
                return JsonResultCommon.Exception(ex);
            }
        }
      
        //[HttpGet("MatHangCha_List")]
        //public async Task<object> MatHangCha_List()
        //{
        //    try
        //    {
        //        var user = Ulities.GetUserByHeader(HttpContext.Request.Headers, _jwtSecret);
        //        if (user is null) return JsonResultCommon.BatBuoc("Đăng nhập");

        //        var lmhclist = await _service.MatHangCha_List();
        //        if (lmhclist.Count() == 0)
        //            return JsonResultCommon.ThatBai("Không có dữ liệu");
        //        if (lmhclist is null)
        //            return JsonResultCommon.KhongTonTai();
        //        return JsonResultCommon.ThanhCong(lmhclist);
        //    }
        //    catch (Exception ex)
        //    {
        //        return JsonResultCommon.Exception(ex);
        //    }
        //}


        [HttpPost("delete-MatHang")]
        public async Task<object> DeleteMatHang(MatHangModel model)
        {
            try
            {
                var user = Ulities.GetUserByHeader(HttpContext.Request.Headers, _jwtSecret);
                if (user is null) return JsonResultCommon.BatBuoc("Đăng nhập");

                //string sqlCheckCode = $"select IdXuatXu from DM_XuatXu where IdXuatXu = {model.IdXuatXu}";
                //bool isExist = GeneralService.IsExistDB(sqlCheckCode, _connectionString);
                //if (!isExist)
                //    if (!isExist) return JsonResultCommon.KhongTonTai("Loại mặt hàng");

                var update = await _service.Delete(model, user.Id);
                if (!update.Susscess)
                {
                    return JsonResultCommon.ThatBai(update.ErrorMessgage);
                }
                return JsonResultCommon.ThanhCong(model);
            }
            catch (Exception ex)
            {
                return JsonResultCommon.Exception(ex);
            }
        }

        [HttpPost("deletes-MatHang")]
        public async Task<object> DeletesMatHang(decimal[] ids)
        {
            try
            {
                var user = Ulities.GetUserByHeader(HttpContext.Request.Headers, _jwtSecret);
                if (user is null) return JsonResultCommon.BatBuoc("Đăng nhập");

                var update = await _service.Deletes(ids, user.Id);
                if (!update.Susscess)
                {
                    return JsonResultCommon.ThatBai(update.ErrorMessgage);
                }
                return JsonResultCommon.ThanhCong(ids);
            }
            catch (Exception ex)
            {
                return JsonResultCommon.Exception(ex);
            }
        }
        //var filePath = Path.Combine(@"..\..\..\..\..\..\assets\media\Img\", file.FileName);
        //var uploadsFolder = Path.Combine(_hostingEnvironment.WebRootPath, "assets", "media", "Img");
        //var filePath = Path.Combine(uploadsFolder, file.FileName);

        //var baseUrl = HttpContext.Request.Scheme + "://" + HttpContext.Request.Host;
        //var filePath = baseUrl + "/assets/media/Img/" + file.FileName;
        [HttpPost("Upload")]
        public async Task<object> Upload(IFormFile file)
        {
            try
            {
                if (file.Length > 0)
                {
               

                    var currentDirectory = Directory.GetCurrentDirectory();
                    var parentDirectory = Directory.GetParent(currentDirectory)?.FullName;
                    if (currentDirectory == null)
                    {
                        return BadRequest("Failed to get parent directory.");
                    }

                    var uploadsFolder = Path.Combine(currentDirectory, "upload");
                    var filePath = Path.Combine(uploadsFolder, file.FileName);
                    if (System.IO.File.Exists(filePath))
                    {
                        return BadRequest("File with the same name already exists.");
                    }
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }
                    return Ok(new { filePath });
                }
                else
                {
                    return BadRequest("No file uploaded.");
                }
            }
            catch (Exception ex)
            {
                return JsonResultCommon.Exception(ex);
            }
        }
        //[HttpPost("Upload")]
        //public async Task<object> Upload(IFormFile file)
        //{
        //    try
        //    {
        //        if (file.Length > 0)
        //        {


        //            var currentDirectory = Directory.GetCurrentDirectory();
        //            var parentDirectory = Directory.GetParent(currentDirectory)?.FullName;
        //            if (parentDirectory == null)
        //            {
        //                return BadRequest("Failed to get parent directory.");
        //            }

        //            var uploadsFolder = Path.Combine(parentDirectory, "JeeBeginner-BE", "JeeBeginner", "src", "assets", "media", "Img");
        //            var filePath = Path.Combine(uploadsFolder, file.FileName);
        //            if (System.IO.File.Exists(filePath))
        //            {
        //                return BadRequest("File with the same name already exists.");
        //            }
        //            using (var stream = new FileStream(filePath, FileMode.Create))
        //            {
        //                await file.CopyToAsync(stream);
        //            }
        //            return JsonResultCommon.ThanhCong(filePath);
        //        }
        //        else
        //        {
        //            return BadRequest("No file uploaded.");
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        return JsonResultCommon.Exception(ex);
        //    }
        //}
    }
}
