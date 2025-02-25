$(document).ready(function() {
    let universityData = [];
    let starData = [];

    // 五標對照表（假設數據，需替換為 2025 年真實五標）
    const gradeStandards = {
        chinese: { top: 13, front: 12, average: 10, back: 9, bottom: 7 },
        english: { top: 13, front: 11, average: 8, back: 4, bottom: 3 },
        mathA: { top: 11, front: 9, average: 6, back: 4, bottom: 3 },
        mathB: { top: 12, front: 10, average: 6, back: 4, bottom: 3 },
        science: { top: 13, front: 12, average: 9, back: 7, bottom: 5 },
        social: { top: 13, front: 12, average: 10, back: 8, bottom: 7 }
    };

// 讀取 starData.json
    $.getJSON('starData.json', function(data) {
        starData = data['Data'];
    }).fail(function() {
        alert('無法讀取 starData.json，請確認檔案是否正確。');
    });

    // 讀取 UniversityData.json
    $('#word-table-body').html('<tr id="loading-message"><td colspan="14">等待資料載入...</td></tr>');

	$.getJSON('UniversityData.json', function(data) {
		universityData = data['University Data'];
		//renderTable(universityData); // 渲染表格

		// 找到剛剛插入的「等待資料載入...」，將其內容改為「資料載入完成」
		$('#loading-message td').text('資料載入完成');
	}).fail(function() {
		$('#result-count').html('<p class="text-danger">無法載入資料，請檢查 UniversityData.json 是否正確。</p>');
		alert('無法讀取資料，請確認 JSON 檔案是否正確。');
	}).always(function() {
		if (universityData.length === 0) {
			$('#loading-message td').text('未能載入任何資料');
		}
	});

// 轉換成績到五標等級
    function getGradeLevel(score, subject) {
        const standards = gradeStandards[subject];
        if (score >= standards.top) return "頂標";
        if (score >= standards.front) return "前標";
        if (score >= standards.average) return "均標";
        if (score >= standards.back) return "後標";
        if (score >= standards.bottom) return "底標";
        return "不及格";
    }

    // 檢查是否符合校系要求
    function meetsCriteria(userGrades, dept, allEmpty) {
        const levels = ["頂標", "前標", "均標", "後標", "底標"];

        // 如果表單全空，返回所有校系
        if (allEmpty) return true;

        // 檢查每科是否符合要求
        const chineseCheck = userGrades.chinese === "不及格" ? dept["國文"] === "--" : (dept["國文"] === "--" || levels.indexOf(userGrades.chinese) <= levels.indexOf(dept["國文"]));
        const englishCheck = userGrades.english === "不及格" ? dept["英文"] === "--" : (dept["英文"] === "--" || levels.indexOf(userGrades.english) <= levels.indexOf(dept["英文"]));
        const mathACheck = userGrades.mathA === "不及格" ? dept["數學A"] === "--" : (dept["數學A"] === "--" || levels.indexOf(userGrades.mathA) <= levels.indexOf(dept["數學A"]));
        const mathBCheck = userGrades.mathB === "不及格" ? dept["數學B"] === "--" : (dept["數學B"] === "--" || levels.indexOf(userGrades.mathB) <= levels.indexOf(dept["數學B"]));
        const scienceCheck = userGrades.science === "不及格" ? dept["自然"] === "--" : (dept["自然"] === "--" || levels.indexOf(userGrades.science) <= levels.indexOf(dept["自然"]));
        const socialCheck = userGrades.social === "不及格" ? dept["社會"] === "--" : (dept["社會"] === "--" || levels.indexOf(userGrades.social) <= levels.indexOf(dept["社會"]));

        return chineseCheck && englishCheck && mathACheck && mathBCheck && scienceCheck && socialCheck;
    }

    // 渲染表格的函數
    function renderTable(data) {
        const tableBody = $('#word-table-body');
        tableBody.empty();

        data.forEach(item => {
            const starItem = starData.find(star => star['校系代碼'] === item['校系代碼']);
            const 第一輪 = starItem ? starItem['第一輪%'] : 'ND';
            const 第二輪 = starItem ? starItem['第二輪%'] : 'ND';

            const row = `
                <tr>
                    <td>${item.校名}</td>
                    <td>${item.校系}</td>
                    <td>${item.校系代碼}</td>
                    <td>${item.學群類別}</td>
                    <td>${item.招生名額}</td>
                    <td>${item.可填志願數}</td>
                    <td>${item.國文 || '-'}</td>
                    <td>${item.英文 || '-'}</td>
                    <td>${item.數學A || '-'}</td>
                    <td>${item.數學B || '-'}</td>
                    <td>${item.自然 || '-'}</td>
                    <td>${item.社會 || '-'}</td>
                    <td>${第一輪}</td>
                    <td>${第二輪}</td>
                </tr>
            `;
            tableBody.append(row);
        });

        $('#result-count').html(`<p class="text-light">篩選結果：${data.length} 個校系</p>`);
    }

    // 顯示五標驗證結果
    function showGradeValidation(userGrades) {
        const validationHtml = `
            <h5>您的五標</h5>
            <div class="list-unstyled">
                國文: ${userGrades.chinese} (${$('#grade-chinese').val() || 0})⠀
                英文: ${userGrades.english} (${$('#grade-english').val() || 0})⠀
                數A: ${userGrades.mathA} (${$('#grade-math-a').val() || 0})⠀
                數B: ${userGrades.mathB} (${$('#grade-math-b').val() || 0})⠀
                自然: ${userGrades.science} (${$('#grade-science').val() || 0})
                社會: ${userGrades.social} (${$('#grade-social').val() || 0})
            </div>
        `;
        $('#grade-validation').html(validationHtml);
    }

    // 搜尋功能
    $('#search-form').on('submit', function(event) {
        event.preventDefault();
        const searchTerm = $('#search-input').val().trim().toLowerCase();
        const filteredData = universityData.filter(item =>
            item.校名.toLowerCase().includes(searchTerm) ||
            item.校系.toLowerCase().includes(searchTerm)
        );
        renderTable(filteredData);
    });

    // 成績篩選功能
    $('#grade-form').on('submit', function(event) {
        event.preventDefault();

        const chineseInput = $('#grade-chinese').val();
        const englishInput = $('#grade-english').val();
        const mathAInput = $('#grade-math-a').val();
        const mathBInput = $('#grade-math-b').val();
        const scienceInput = $('#grade-science').val();
        const socialInput = $('#grade-social').val();

        // 檢查是否所有欄位都為空
        const allEmpty = !chineseInput && !englishInput && !mathAInput && !mathBInput && !scienceInput && !socialInput;

        const userGrades = {
            chinese: getGradeLevel(parseInt(chineseInput) || 0, 'chinese'),
            english: getGradeLevel(parseInt(englishInput) || 0, 'english'),
            mathA: getGradeLevel(parseInt(mathAInput) || 0, 'mathA'),
            mathB: getGradeLevel(parseInt(mathBInput) || 0, 'mathB'),
            science: getGradeLevel(parseInt(scienceInput) || 0, 'science'),
            social: getGradeLevel(parseInt(socialInput) || 0, 'social')
        };

        showGradeValidation(userGrades);

        // 如果表單全空，顯示所有校系；否則按條件篩選
        const filteredData = allEmpty ? universityData : universityData.filter(dept => meetsCriteria(userGrades, dept, allEmpty));
        renderTable(filteredData);
    });

    // 回到頂端按鈕功能
    $('#scrollToTop').click(function() {
        $('html, body').animate({ scrollTop: 0 }, 500);
    });

    // 滾動事件來顯示/隱藏回到頂端按鈕
    $(window).scroll(function() {
        if ($(this).scrollTop() > 200) {
            $('#scrollToTop').fadeIn();
        } else {
            $('#scrollToTop').fadeOut();
        }
    });

    // 頁面載入時隱藏回到頂端按鈕
    $('#scrollToTop').hide();
});