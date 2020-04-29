var functions = require(_directory_base + '/app/libraries/function.js');

exports.getBlok = async (req, res) => {
    let blok = req.params.blok;
    let query = `
    SELECT est.werks AS ba_code,
         tgl.tanggal AS report_date,
         budget.afd_code AS afd_code,
         budget.block_code AS block_code,
         NVL (prod.ton_produksi, 0) AS ton_actual,
         NVL (budget.budget_harian, 0) AS ton_target,
         CASE
            WHEN NVL (prod.ton_produksi, 0) < NVL (budget.budget_harian, 0)
            THEN
               '#FF0000'
            WHEN NVL (prod.ton_produksi, 0) > NVL (budget.budget_harian, 0)
            THEN
               '#00FF00'
            ELSE
               ' '
         END
            AS color
    FROM (SELECT *
            FROM tap_dw.tm_est
           WHERE     region_code <> '03'
                 AND SUBSTR (werks, 3, 1) NOT IN ('3', '4')
                 AND werks <> '2123') est
         LEFT JOIN tap_dw.tm_comp comp ON est.comp_code = comp.comp_code
         LEFT JOIN (SELECT *
                      FROM tap_dw.tm_time_daily
                     WHERE tanggal = TRUNC (SYSDATE - 1)) tgl
            ON tgl.werks = est.werks
         LEFT JOIN
         (SELECT bud.spmon,
                 bud.werks,
                 bud.afd_code,
                 bud.block_code,
                 bud.budget / mo.hke AS budget_harian
            FROM (  SELECT spmon,
                           werks,
                           afd_code,
                           block_code,
                           SUM (budget_kg) / 1000 AS budget
                      FROM tap_dw.tr_hv_budget_target
                     WHERE TRUNC (spmon, 'YEAR') = TRUNC (SYSDATE - 1, 'YEAR')
                  GROUP BY spmon,
                           werks,
                           afd_code,
                           block_code) bud
                 LEFT JOIN tap_dw.tm_time_monthly mo
                    ON mo.werks = bud.werks AND mo.spmon = bud.spmon) budget
            ON     est.werks = budget.werks
               AND LAST_DAY (tgl.tanggal) = budget.spmon
         LEFT JOIN (  SELECT werks,
                             afd_code,
                             block_code,
                             tgl_panen,
                             SUM (NVL (kg_taksasi, 0) / 1000) AS ton_produksi
                        FROM tap_dw.tr_hv_productivity_daily
                       WHERE tgl_panen = TRUNC (SYSDATE - 1)
                    GROUP BY werks,
                             afd_code,
                             block_code,
                             tgl_panen) prod
            ON     est.werks = prod.werks
               AND tgl.tanggal = prod.tgl_panen
               AND budget.afd_code = prod.afd_code
               AND budget.block_code = prod.block_code
    WHERE est.werks||budget.block_code = '${blok}'
    `;
    functions.fetch(query, res);
}

exports.getBA = async (req, res) => {
    let ba = req.params.ba;
    let query = `
    SELECT est.werks AS ba_code,
        tgl.tanggal AS report_date,
        NVL (prod.ton_produksi, 0) AS ton_actual,
        NVL (budget.budget_harian, 0) AS ton_target,
        CASE
        WHEN NVL (prod.ton_produksi, 0) < NVL (budget.budget_harian, 0)
        THEN
            '#FF0000'
        WHEN NVL (prod.ton_produksi, 0) > NVL (budget.budget_harian, 0)
        THEN
            '#00FF00'
        ELSE
            ' '
        END
        AS color
    FROM (SELECT *
        FROM tap_dw.tm_est
        WHERE     region_code <> '03'
                AND SUBSTR (werks, 3, 1) NOT IN ('3', '4')
                AND werks <> '2123') est
        LEFT JOIN tap_dw.tm_comp comp ON est.comp_code = comp.comp_code
        LEFT JOIN (SELECT *
                    FROM tap_dw.tm_time_daily
                    WHERE tanggal = TRUNC (SYSDATE - 1)) tgl
        ON tgl.werks = est.werks
        LEFT JOIN
        (SELECT bud.spmon, bud.werks, bud.budget / mo.hke AS budget_harian
        FROM (  SELECT spmon, werks, SUM (budget_kg) / 1000 AS budget
                    FROM tap_dw.tr_hv_budget_target
                    WHERE TRUNC (spmon, 'YEAR') = TRUNC (SYSDATE - 1, 'YEAR')
                GROUP BY spmon, werks) bud
                LEFT JOIN tap_dw.tm_time_monthly mo
                ON mo.werks = bud.werks AND mo.spmon = bud.spmon) budget
        ON     est.werks = budget.werks
            AND LAST_DAY (tgl.tanggal) = budget.spmon
        LEFT JOIN
        (  SELECT werks,
                tgl_panen,
                SUM (NVL (kg_taksasi, 0) / 1000) AS ton_produksi
            FROM tap_dw.tr_hv_productivity_daily
            WHERE tgl_panen = TRUNC (SYSDATE - 1)
            GROUP BY werks, tgl_panen) prod
    ON est.werks = prod.werks AND tgl.tanggal = prod.tgl_panen
    WHERE est.werks = '${ba}'
    `;
    functions.fetch(query, res);
}

exports.getAFD = async (req, res) => {
    let afd = req.params.afd;
    let query = `
    SELECT est.werks AS ba_code,
        tgl.tanggal AS report_date,
        budget.afd_code as afd_code,
        NVL (prod.ton_produksi, 0) AS ton_actual,
        NVL (budget.budget_harian, 0) AS ton_target,
        CASE
        WHEN NVL (prod.ton_produksi, 0) < NVL (budget.budget_harian, 0)
        THEN
            '#FF0000'
        WHEN NVL (prod.ton_produksi, 0) > NVL (budget.budget_harian, 0)
        THEN
            '#00FF00'
        ELSE
            ' '
        END
        AS color
    FROM (SELECT *
        FROM tap_dw.tm_est
        WHERE     region_code <> '03'
                AND SUBSTR (werks, 3, 1) NOT IN ('3', '4')
                AND werks <> '2123') est
        LEFT JOIN tap_dw.tm_comp comp ON est.comp_code = comp.comp_code
        LEFT JOIN (SELECT *
                    FROM tap_dw.tm_time_daily
                    WHERE tanggal = TRUNC (SYSDATE - 1)) tgl
        ON tgl.werks = est.werks
        LEFT JOIN
        (SELECT bud.spmon,
                bud.werks,
                bud.afd_code,
                bud.budget / mo.hke AS budget_harian
        FROM (  SELECT spmon,
                        werks,
                        afd_code,
                        SUM (budget_kg) / 1000 AS budget
                    FROM tap_dw.tr_hv_budget_target
                    WHERE TRUNC (spmon, 'YEAR') = TRUNC (SYSDATE - 1, 'YEAR')
                GROUP BY spmon, werks, afd_code) bud
                LEFT JOIN tap_dw.tm_time_monthly mo
                ON mo.werks = bud.werks AND mo.spmon = bud.spmon) budget
        ON     est.werks = budget.werks
            AND LAST_DAY (tgl.tanggal) = budget.spmon
        LEFT JOIN (  SELECT werks,
                            afd_code,
                            tgl_panen,
                            SUM (NVL (kg_taksasi, 0) / 1000) AS ton_produksi
                    FROM tap_dw.tr_hv_productivity_daily
                    WHERE tgl_panen = TRUNC (SYSDATE - 1)
                GROUP BY werks, afd_code, tgl_panen) prod
        ON     est.werks = prod.werks
            AND tgl.tanggal = prod.tgl_panen
            AND budget.afd_code = prod.afd_code
    WHERE est.werks||budget.afd_code = '${afd}'
    `;
    functions.fetch(query, res);
}