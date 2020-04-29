var functions = require(_directory_base + '/app/libraries/function.js');

exports.getAFD = async (req, res) => {
    var query = `
    SELECT mst.werks,
        mst.afd_code AS afdeling_code,
        est.afd_name AS afdeling_name,
        mst.tonase_actual,
        mst.tonase_target,
        mst.map_color
    FROM (SELECT est.werks AS werks,
                est.afd_code,
                tgl.tanggal AS report_date,
                NVL (prod.ton_produksi, 0) AS tonase_actual,
                NVL (budget.budget_harian, 0) AS tonase_target,
                CASE
                WHEN NVL (
                            NVL (prod.ton_produksi, 0)
                        / NULLIF (NVL (budget.budget_harian, 0), 0)
                        * 100,
                        0) < 85
                THEN
                    '#FF0000'
                WHEN NVL (
                            NVL (prod.ton_produksi, 0)
                        / NULLIF (NVL (budget.budget_harian, 0), 0)
                        * 100,
                        0) BETWEEN 85
                                AND 95
                THEN
                    '#FFFF00'
                WHEN NVL (
                            NVL (prod.ton_produksi, 0)
                        / NULLIF (NVL (budget.budget_harian, 0), 0)
                        * 100,
                        0) > 95
                THEN
                    '#00FF00'
                END
                AS map_color
        FROM (SELECT *
                FROM tap_dw.tm_afd
                WHERE     region_code <> '03'
                        AND SUBSTR (werks, 3, 1) NOT IN ('3', '4')
                        AND werks <> '2123') est
                LEFT JOIN tap_dw.tm_comp comp
                ON est.comp_code = comp.comp_code
                LEFT JOIN (SELECT *
                            FROM tap_dw.tm_time_daily
                            WHERE tanggal = TRUNC (SYSDATE - 1)) tgl
                ON tgl.werks = est.werks
                LEFT JOIN
                (SELECT bud.spmon,
                        bud.werks,
                        afd_code,
                        bud.budget / mo.hke AS budget_harian
                FROM (  SELECT spmon,
                                werks,
                                afd_code,
                                SUM (budget_kg) / 1000 AS budget
                            FROM tap_dw.tr_hv_budget_target
                            WHERE TRUNC (spmon, 'YEAR') =
                                    TRUNC (SYSDATE - 1, 'YEAR')
                        GROUP BY spmon, werks, afd_code) bud
                        LEFT JOIN tap_dw.tm_time_monthly mo
                        ON mo.werks = bud.werks AND mo.spmon = bud.spmon)
                budget
                ON     est.werks = budget.werks
                    AND est.afd_code = budget.afd_code
                    AND LAST_DAY (tgl.tanggal) = budget.spmon
                LEFT JOIN
                (  SELECT werks,
                        afd_code,
                        tgl_panen,
                        SUM (NVL (kg_taksasi, 0) / 1000) AS ton_produksi
                    FROM tap_dw.tr_hv_productivity_daily
                    WHERE tgl_panen = TRUNC (SYSDATE - 1)
                GROUP BY werks, tgl_panen, afd_code) prod
                ON     est.werks = prod.werks
                    AND est.afd_code = prod.afd_code
                    AND tgl.tanggal = prod.tgl_panen) mst
        LEFT JOIN tap_dw.tm_afd est
        ON     est.werks = mst.werks
            AND mst.afd_code = est.afd_code
            AND mst.report_date BETWEEN est.start_valid AND est.end_valid
    `;
    functions.fetch(query, res);
}

exports.getBlok = async (req, res) => {
    var query = `
    SELECT mst.werks,
        mst.afd_code AS afdeling_code,
        mst.block_code,
        est.block_name AS block_name,
        mst.tonase_actual,
        mst.tonase_target,
        mst.map_color
    FROM (SELECT est.werks AS werks,
                est.afd_code,
                est.block_code,
                tgl.tanggal AS report_date,
                NVL (prod.ton_produksi, 0) AS tonase_actual,
                NVL (budget.budget_harian, 0) AS tonase_target,
                CASE
                WHEN NVL (
                            NVL (prod.ton_produksi, 0)
                        / NULLIF (NVL (budget.budget_harian, 0), 0)
                        * 100,
                        0) < 85
                THEN
                    '#FF0000'
                WHEN NVL (
                            NVL (prod.ton_produksi, 0)
                        / NULLIF (NVL (budget.budget_harian, 0), 0)
                        * 100,
                        0) BETWEEN 85
                                AND 95
                THEN
                    '#FFFF00'
                WHEN NVL (
                            NVL (prod.ton_produksi, 0)
                        / NULLIF (NVL (budget.budget_harian, 0), 0)
                        * 100,
                        0) > 95
                THEN
                    '#00FF00'
                END
                AS map_color
        FROM (SELECT *
                FROM tap_dw.tm_block
                WHERE     region_code <> '03'
                        AND SUBSTR (werks, 3, 1) NOT IN ('3', '4')
                        AND werks <> '2123') est
                LEFT JOIN tap_dw.tm_comp comp
                ON est.comp_code = comp.comp_code
                LEFT JOIN (SELECT *
                            FROM tap_dw.tm_time_daily
                            WHERE tanggal = TRUNC (SYSDATE - 1)) tgl
                ON tgl.werks = est.werks
                LEFT JOIN
                (SELECT bud.spmon,
                        bud.werks,
                        afd_code,
                        block_code,
                        bud.budget / mo.hke AS budget_harian
                FROM (  SELECT spmon,
                                werks,
                                afd_code,
                                block_code,
                                SUM (budget_kg) / 1000 AS budget
                            FROM tap_dw.tr_hv_budget_target
                            WHERE TRUNC (spmon, 'YEAR') =
                                    TRUNC (SYSDATE - 1, 'YEAR')
                        GROUP BY spmon,
                                werks,
                                afd_code,
                                block_code) bud
                        LEFT JOIN tap_dw.tm_time_monthly mo
                        ON mo.werks = bud.werks AND mo.spmon = bud.spmon)
                budget
                ON     est.werks = budget.werks
                    AND est.afd_code = budget.afd_code
                    AND est.block_code = budget.block_code
                    AND LAST_DAY (tgl.tanggal) = budget.spmon
                LEFT JOIN
                (  SELECT werks,
                        afd_code,
                        block_code,
                        tgl_panen,
                        SUM (NVL (kg_taksasi, 0) / 1000) AS ton_produksi
                    FROM tap_dw.tr_hv_productivity_daily
                    WHERE tgl_panen = TRUNC (SYSDATE - 1)
                GROUP BY werks,
                        tgl_panen,
                        afd_code,
                        block_code) prod
                ON     est.werks = prod.werks
                    AND est.afd_code = prod.afd_code
                    AND est.block_code = budget.block_code
                    AND tgl.tanggal = prod.tgl_panen) mst
        LEFT JOIN tap_dw.tm_block est
        ON     est.werks = mst.werks
            AND mst.afd_code = est.afd_code
            AND mst.block_code = est.block_code
            AND mst.report_date BETWEEN est.start_valid AND est.end_valid
    `;
    functions.fetch(query, res);
}

exports.getCompany = async (req, res) => {
    var query = `
    SELECT mst.comp_code AS company_code,
        est.comp_name AS company_name,
        SUM (mst.tonase_actual) AS tonase_actual,
        SUM (mst.tonase_target) AS tonase_target,
        CASE
        WHEN NVL (
                    SUM (mst.tonase_actual)
                / NULLIF (SUM (mst.tonase_target), 0)
                * 100,
                0) < 85
        THEN
            '#FF0000'
        WHEN NVL (
                    SUM (mst.tonase_actual)
                / NULLIF (SUM (mst.tonase_target), 0)
                * 100,
                0) BETWEEN 85
                        AND 95
        THEN
            '#FFFF00'
        WHEN NVL (
                    SUM (mst.tonase_actual)
                / NULLIF (SUM (mst.tonase_target), 0)
                * 100,
                0) > 95
        THEN
            '#00FF00'
        END
        AS map_color
    FROM (SELECT est.comp_code,
                est.werks AS werks,
                tgl.tanggal AS report_date,
                NVL (prod.ton_produksi, 0) AS tonase_actual,
                NVL (budget.budget_harian, 0) AS tonase_target
        FROM (SELECT *
                FROM tap_dw.tm_est
                WHERE     region_code <> '03'
                        AND SUBSTR (werks, 3, 1) NOT IN ('3', '4')
                        AND werks <> '2123') est
                LEFT JOIN tap_dw.tm_comp comp
                ON est.comp_code = comp.comp_code
                LEFT JOIN (SELECT *
                            FROM tap_dw.tm_time_daily
                            WHERE tanggal = TRUNC (SYSDATE - 1)) tgl
                ON tgl.werks = est.werks
                LEFT JOIN
                (SELECT bud.spmon,
                        bud.werks,
                        bud.budget / mo.hke AS budget_harian
                FROM (  SELECT spmon, werks, SUM (budget_kg) / 1000 AS budget
                            FROM tap_dw.tr_hv_budget_target
                            WHERE TRUNC (spmon, 'YEAR') =
                                    TRUNC (SYSDATE - 1, 'YEAR')
                        GROUP BY spmon, werks) bud
                        LEFT JOIN tap_dw.tm_time_monthly mo
                        ON mo.werks = bud.werks AND mo.spmon = bud.spmon)
                budget
                ON     est.werks = budget.werks
                    AND LAST_DAY (tgl.tanggal) = budget.spmon
                LEFT JOIN
                (  SELECT werks,
                        tgl_panen,
                        SUM (NVL (kg_taksasi, 0) / 1000) AS ton_produksi
                    FROM tap_dw.tr_hv_productivity_daily
                    WHERE tgl_panen = TRUNC (SYSDATE - 1)
                GROUP BY werks, tgl_panen) prod
                ON est.werks = prod.werks AND tgl.tanggal = prod.tgl_panen)
        mst
        LEFT JOIN tap_dw.tm_comp est ON est.comp_code = mst.comp_code
    GROUP BY mst.comp_code, est.comp_name
    `;
    functions.fetch(query, res);
}

exports.getEstate = async (req, res) => {
    var query = `
    SELECT mst.werks,
        est_name AS estate_name,
        mst.tonase_actual,
        mst.tonase_target,
        mst.map_color
    FROM (SELECT est.werks AS werks,
                tgl.tanggal AS report_date,
                NVL (prod.ton_produksi, 0) AS tonase_actual,
                NVL (budget.budget_harian, 0) AS tonase_target,
                CASE
                WHEN NVL (
                            NVL (prod.ton_produksi, 0)
                        / NULLIF (NVL (budget.budget_harian, 0), 0)
                        * 100,
                        0) < 85
                THEN
                    '#FF0000'
                WHEN NVL (
                            NVL (prod.ton_produksi, 0)
                        / NULLIF (NVL (budget.budget_harian, 0), 0)
                        * 100,
                        0) BETWEEN 85
                                AND 95
                THEN
                    '#FFFF00'
                WHEN NVL (
                            NVL (prod.ton_produksi, 0)
                        / NULLIF (NVL (budget.budget_harian, 0), 0)
                        * 100,
                        0) > 95
                THEN
                    '#00FF00'
                END
                AS map_color
        FROM (SELECT *
                FROM tap_dw.tm_est
                WHERE     region_code <> '03'
                        AND SUBSTR (werks, 3, 1) NOT IN ('3', '4')
                        AND werks <> '2123') est
                LEFT JOIN tap_dw.tm_comp comp
                ON est.comp_code = comp.comp_code
                LEFT JOIN (SELECT *
                            FROM tap_dw.tm_time_daily
                            WHERE tanggal = TRUNC (SYSDATE - 1)) tgl
                ON tgl.werks = est.werks
                LEFT JOIN
                (SELECT bud.spmon,
                        bud.werks,
                        bud.budget / mo.hke AS budget_harian
                FROM (  SELECT spmon, werks, SUM (budget_kg) / 1000 AS budget
                            FROM tap_dw.tr_hv_budget_target
                            WHERE TRUNC (spmon, 'YEAR') =
                                    TRUNC (SYSDATE - 1, 'YEAR')
                        GROUP BY spmon, werks) bud
                        LEFT JOIN tap_dw.tm_time_monthly mo
                        ON mo.werks = bud.werks AND mo.spmon = bud.spmon)
                budget
                ON     est.werks = budget.werks
                    AND LAST_DAY (tgl.tanggal) = budget.spmon
                LEFT JOIN
                (  SELECT werks,
                        tgl_panen,
                        SUM (NVL (kg_taksasi, 0) / 1000) AS ton_produksi
                    FROM tap_dw.tr_hv_productivity_daily
                    WHERE tgl_panen = TRUNC (SYSDATE - 1)
                GROUP BY werks, tgl_panen) prod
                ON est.werks = prod.werks AND tgl.tanggal = prod.tgl_panen)
        mst
        LEFT JOIN tap_dw.tm_est est
        ON     est.werks = mst.werks
            AND mst.report_date BETWEEN est.start_valid AND est.end_valid
    `;
    functions.fetch(query, res);
}