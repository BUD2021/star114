$(document).ready(function() {
    let universityData = [];

    // 讀取 JSON 檔案
    $.getJSON('UniversityData.json', function(data) {
        universityData = data['University Data'];
        renderTable(universityData);
    }).fail(function() {
        alert('無法讀取資料，請確認 JSON 檔案是否正確。');
    });

    // 渲染表格的函數
    function renderTable(data) {
        const tableBody = $('#word-table-body');
        tableBody.empty(); // 清空現有資料

        data.forEach(item => {
            const row = `
                <tr>
                    <td>${item.校名}</td>
                    <td>${item.校系}</td>
                    <td>${item.校系代碼}</td>
                    <td>${item.國文}</td>
                    <td>${item.英文}</td>
                    <td>${item.數學A}</td>
                    <td>${item.數學B}</td>
                    <td>${item.自然}</td>
                    <td>${item.社會}</td>
                </tr>
            `;
            tableBody.append(row);
        });
    }

    // 搜尋功能
    $('#search-form').submit(function(event) {
        event.preventDefault(); // 防止表單默認提交行為
        const searchTerm = $('#search-input').val().trim().toLowerCase();
        const filteredData = universityData.filter(item =>
            item.校名.toLowerCase().includes(searchTerm) || 
            item.校系.toLowerCase().includes(searchTerm)
        );
        renderTable(filteredData); // 渲染搜尋結果
    });

    // 回到頂端按鈕功能
    $('#scrollToTop').click(function() {
        $('html, body').animate({ scrollTop: 0 }, 500);
    });

    // 滾動事件來顯示/隱藏回到頂端按鈕
    $(window).scroll(function() {
        if ($(this).scrollTop() > 200) {
            $('#scrollToTop').fadeIn(); // 顯示按鈕
        } else {
            $('#scrollToTop').fadeOut(); // 隱藏按鈕
        }
    });

    // 頁面載入時隱藏回到頂端按鈕
    $('#scrollToTop').hide();
});