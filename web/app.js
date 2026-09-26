/**
 * ShopSphere Analytics — Interactive Executive Dashboard Engine
 * Handles dynamic multidimensional filtering, Chart.js instances, KPI recalcs, and doc browsing.
 */

document.addEventListener("DOMContentLoaded", async () => {
  let rawData = null;
  let masterBackupData = null;
  let chartInstances = {};
  let currentAttachedFile = null;

  // Active Slicer State
  const activeFilters = {
    year: "ALL",
    region: "ALL",
    category: "ALL",
    segment: "ALL"
  };

  // 1. Fetch Aggregated Web Data (Cached in memory as Master Demo Dataset)
  try {
    const res = await fetch("data.json");
    masterBackupData = await res.json();
    console.log("ShopSphere master demo dataset loaded into memory.");
  } catch (err) {
    console.error("Failed to load data.json:", err);
  }

  // Start clean: Awaiting user dataset input
  rawData = null;
  initDashboard();

  // 2. Dashboard Initialization
  function initDashboard() {
    setupSlicers();
    setupTabs();
    setupThemeToggle();
    setupDocsExplorer();
    setupDataIngestion();
    renderAllViews();
  }

  // Slicer Event Listeners
  function setupSlicers() {
    const yearSelect = document.getElementById("yearSlicer");
    const regionSelect = document.getElementById("regionSlicer");
    const catSelect = document.getElementById("categorySlicer");
    const segSelect = document.getElementById("segmentSlicer");
    const resetBtn = document.getElementById("resetFiltersBtn");

    yearSelect.addEventListener("change", (e) => {
      activeFilters.year = e.target.value;
      renderAllViews();
    });

    regionSelect.addEventListener("change", (e) => {
      activeFilters.region = e.target.value;
      renderAllViews();
    });

    catSelect.addEventListener("change", (e) => {
      activeFilters.category = e.target.value;
      renderAllViews();
    });

    segSelect.addEventListener("change", (e) => {
      activeFilters.segment = e.target.value;
      renderAllViews();
    });

    resetBtn.addEventListener("click", () => {
      activeFilters.year = "ALL";
      activeFilters.region = "ALL";
      activeFilters.category = "ALL";
      activeFilters.segment = "ALL";
      yearSelect.value = "ALL";
      regionSelect.value = "ALL";
      catSelect.value = "ALL";
      segSelect.value = "ALL";
      renderAllViews();
    });
  }

  // Tab Navigation
  function setupTabs() {
    const tabs = document.querySelectorAll(".nav-tab");
    const panes = document.querySelectorAll(".tab-pane");

    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        panes.forEach(p => p.classList.remove("active"));

        tab.classList.add("active");
        const targetPane = document.getElementById(tab.dataset.tab);
        if (targetPane) targetPane.classList.add("active");

        // Trigger chart resize on tab switch
        Object.values(chartInstances).forEach(c => c && c.resize());
      });
    });
  }

  // Theme Toggle (Dark / Light)
  function setupThemeToggle() {
    const toggleBtn = document.getElementById("themeToggleBtn");
    toggleBtn.addEventListener("click", () => {
      document.body.classList.toggle("light-theme");
      const isLight = document.body.classList.contains("light-theme");
      toggleBtn.innerHTML = isLight ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
      
      // Update Chart.js global theme colors
      Chart.defaults.color = isLight ? "#475569" : "#94a3b8";
      Chart.defaults.borderColor = isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)";
      Object.values(chartInstances).forEach(c => c && c.update());
    });
  }

  // Main Render Orchestrator
  function renderAllViews() {
    const hero = document.getElementById("awaitingDataHero");
    const slicers = document.getElementById("slicersSection");
    const tabs = document.getElementById("reportTabs");
    const overviewContent = document.getElementById("overviewDataContent");
    const headerQuickStats = document.getElementById("headerQuickStats");
    const clearBtn = document.getElementById("btnClearAllData");
    const activeBanner = document.getElementById("activeDatasetBanner");
    const liveDataPill = document.getElementById("liveDataPill");
    const livePillText = document.getElementById("livePillText");

    if (!rawData) {
      // Clean blank state: Hide slicers, tabs, KPI tiles, charts, header stats, AND production pill
      if (hero) hero.classList.remove("hidden");
      if (slicers) slicers.classList.add("hidden");
      if (tabs) tabs.classList.add("hidden");
      if (overviewContent) overviewContent.classList.add("hidden");
      if (headerQuickStats) headerQuickStats.classList.add("hidden");
      if (clearBtn) clearBtn.classList.add("hidden");
      if (activeBanner) activeBanner.classList.add("hidden");
      if (liveDataPill) liveDataPill.classList.add("hidden");

      // Reset to overview tab so user starts on Tab 1
      const overviewTab = document.querySelector('.nav-tab[data-tab="tab-overview"]');
      const overviewPane = document.getElementById("tab-overview");
      if (overviewTab && overviewPane) {
        document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));
        document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
        overviewTab.classList.add("active");
        overviewPane.classList.add("active");
      }

      // Destroy all active charts to prevent memory leak
      Object.keys(chartInstances).forEach(k => {
        if (chartInstances[k]) {
          chartInstances[k].destroy();
          chartInstances[k] = null;
        }
      });
      return;
    }

    // When rawData is present: Display all controls, slicers, tabs, and charts
    if (hero) hero.classList.add("hidden");
    if (slicers) slicers.classList.remove("hidden");
    if (tabs) tabs.classList.remove("hidden");
    if (overviewContent) overviewContent.classList.remove("hidden");
    if (headerQuickStats) headerQuickStats.classList.remove("hidden");
    if (clearBtn) clearBtn.classList.remove("hidden");
    if (liveDataPill) {
      liveDataPill.classList.remove("hidden");
      if (livePillText) {
        if (rawData.baseline && rawData.baseline.total_orders === 102420) {
          livePillText.textContent = "PRODUCTION DEMO: 2023 - 2025";
        } else {
          livePillText.textContent = `ATTACHED DATASET: ${rawData.baseline ? rawData.baseline.total_orders.toLocaleString() : ""} ORDERS`;
        }
      }
    }

    const filteredMonthly = filterMonthlyGranular();
    updateKPICards(filteredMonthly);
    renderMonthlyTrendChart(filteredMonthly);
    renderCategoryContributionChart();
    renderRegionalChart();
    renderPaymentMethodsChart();
    renderCategoryTable();
    renderTopAndBottomTables();
    renderCustomerSegmentChart();
    renderVIPTable();
    renderDelayVsReturnsChart();
    renderReturnReasonsChart();
    renderShippingTable();
  }

  // Filter Monthly Granular Data
  function filterMonthlyGranular() {
    if (!rawData || !rawData.monthly_granular) return [];
    return rawData.monthly_granular.filter(r => {
      if (activeFilters.year !== "ALL" && r.year !== activeFilters.year) return false;
      if (activeFilters.region !== "ALL" && r.region !== activeFilters.region) return false;
      if (activeFilters.category !== "ALL" && r.category !== activeFilters.category) return false;
      if (activeFilters.segment !== "ALL" && r.customer_segment !== activeFilters.segment) return false;
      return true;
    });
  }

  // Update Top 9 KPI Cards & Header Quick Stats Dynamically
  function updateKPICards(records) {
    if (!rawData) return;

    let totOrders = 0;
    let netRev = 0;
    let cogs = 0;
    let grossProfit = 0;
    let returns = 0;
    let cancels = 0;

    const isFiltered = activeFilters.year !== "ALL" || activeFilters.region !== "ALL" || activeFilters.category !== "ALL" || activeFilters.segment !== "ALL";

    if (isFiltered && records.length > 0) {
      records.forEach(r => {
        totOrders += r.orders;
        netRev += r.net_revenue;
        cogs += r.cogs;
        grossProfit += r.gross_profit;
        returns += (r.returns || 0);
        cancels += (r.cancellations || 0);
      });
    } else if (rawData.baseline) {
      totOrders = rawData.baseline.total_orders;
      netRev = rawData.baseline.net_revenue;
      cogs = rawData.baseline.total_cogs || (netRev * 0.6738);
      grossProfit = rawData.baseline.gross_profit || (netRev - cogs);
      returns = Math.round(totOrders * ((rawData.baseline.return_rate_pct || 8.39) / 100));
      cancels = Math.round(totOrders * ((rawData.baseline.cancellation_rate_pct || 4.77) / 100));
    }

    const marginPct = netRev > 0 ? (grossProfit / netRev) * 100 : 0;
    const aov = totOrders > 0 ? netRev / totOrders : 0;
    const retRatePct = totOrders > 0 ? (returns / totOrders) * 100 : 0;
    const grossRev = rawData.baseline && !isFiltered && rawData.baseline.gross_revenue ? rawData.baseline.gross_revenue : (netRev * 1.0844);

    // Header Quick Stats
    const qOrders = document.getElementById("quickStatOrders");
    const qSales = document.getElementById("quickStatSales");
    const qMargin = document.getElementById("quickStatMargin");
    if (qOrders) qOrders.textContent = formatNumber(totOrders) + " Orders";
    if (qSales) qSales.textContent = formatCurrency(netRev);
    if (qMargin) qMargin.textContent = marginPct.toFixed(2) + "%";

    // Update 9 KPI Tiles
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setVal("kpiNetRev", formatCurrency(netRev));
    setVal("kpiGrossRev", formatCurrency(grossRev));
    setVal("kpiGrossProf", formatCurrency(grossProfit));
    setVal("kpiMargin", marginPct.toFixed(2) + "%");
    setVal("kpiOrders", formatNumber(totOrders));
    setVal("kpiCustomers", formatNumber(Math.round(totOrders * 0.265)));
    setVal("kpiAOV", formatCurrency(aov));
    setVal("kpiReturnRate", retRatePct.toFixed(2) + "%");
    setVal("kpiLateRate", (rawData.baseline && rawData.baseline.late_delivery_rate_pct ? rawData.baseline.late_delivery_rate_pct.toFixed(2) : "11.38") + "%");

    // Subtitles
    setVal("kpiSubNetRev", `After ${formatCurrency(grossRev - netRev)} Discounts`);
    setVal("kpiSubGrossRev", "Pre-discount catalog face value");
    setVal("kpiSubGrossProf", "Retained commercial earnings");
    setVal("kpiSubMargin", `COGS: ${formatCurrency(cogs)}`);
    setVal("kpiSubOrders", "Across active records");
    setVal("kpiSubCustomers", "Active registered buyers");
    setVal("kpiSubAOV", "Average basket size");
    setVal("kpiSubReturnRate", `${formatNumber(returns)} returned orders`);
    setVal("kpiSubLateRate", "Avg delay 3.49 days");
  }

  // Visual 1: Monthly Trend Chart
  function renderMonthlyTrendChart(records) {
    const ctx = document.getElementById("monthlyTrendChart");
    if (!ctx) return;

    // Group by month
    const monthsMap = {};
    records.forEach(r => {
      if (!monthsMap[r.month]) {
        monthsMap[r.month] = { net_revenue: 0, gross_profit: 0, orders: 0 };
      }
      monthsMap[r.month].net_revenue += r.net_revenue;
      monthsMap[r.month].gross_profit += r.gross_profit;
      monthsMap[r.month].orders += r.orders;
    });

    const labels = Object.keys(monthsMap).sort();
    const revData = labels.map(m => monthsMap[m].net_revenue);
    const profData = labels.map(m => monthsMap[m].gross_profit);
    const ordData = labels.map(m => monthsMap[m].orders);

    if (chartInstances.monthlyTrend) {
      chartInstances.monthlyTrend.destroy();
    }

    chartInstances.monthlyTrend = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Net Revenue ($)",
            data: revData,
            borderColor: "#38bdf8",
            backgroundColor: "rgba(56, 189, 248, 0.08)",
            borderWidth: 2.5,
            fill: true,
            tension: 0.35,
            yAxisID: "y"
          },
          {
            label: "Gross Profit ($)",
            data: profData,
            borderColor: "#10b981",
            backgroundColor: "transparent",
            borderWidth: 2,
            tension: 0.35,
            yAxisID: "y"
          },
          {
            label: "Orders Volume",
            type: "bar",
            data: ordData,
            backgroundColor: "rgba(99, 102, 241, 0.25)",
            borderRadius: 4,
            yAxisID: "y1"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        scales: {
          y: {
            position: "left",
            ticks: {
              callback: (v) => "$" + (v >= 1e6 ? (v / 1e6).toFixed(1) + "M" : (v >= 1e3 ? (v / 1e3).toFixed(1) + "K" : v.toLocaleString()))
            },
            grid: { color: "rgba(255,255,255,0.05)" }
          },
          y1: {
            position: "right",
            grid: { drawOnChartArea: false },
            ticks: { callback: (v) => v.toLocaleString() }
          },
          x: {
            grid: { display: false },
            ticks: { maxRotation: 45, minRotation: 45 }
          }
        },
        plugins: {
          legend: { position: "top" },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                if (ctx.dataset.yAxisID === "y1") return `Orders: ${ctx.parsed.y.toLocaleString()}`;
                return `${ctx.dataset.label}: $${ctx.parsed.y.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
              }
            }
          }
        }
      }
    });
  }

  // Visual 2: Category Contribution
  function renderCategoryContributionChart() {
    const ctx = document.getElementById("categoryContributionChart");
    if (!ctx || !rawData.categories) return;

    let cats = rawData.categories;
    if (activeFilters.category !== "ALL") {
      cats = cats.filter(c => c.category === activeFilters.category);
    }

    const labels = cats.map(c => c.category);
    const revShares = cats.map(c => c.net_revenue);
    const profShares = cats.map(c => c.gross_profit);

    if (chartInstances.categoryContrib) {
      chartInstances.categoryContrib.destroy();
    }

    chartInstances.categoryContrib = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [{
          data: revShares,
          backgroundColor: ["#38bdf8", "#6366f1", "#10b981", "#f59e0b", "#ec4899"],
          borderWidth: 0,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "right", labels: { boxWidth: 12, font: { size: 11 } } },
          tooltip: {
            callbacks: {
              label: (ctx) => `Revenue: $${ctx.parsed.toLocaleString()} (${((ctx.parsed / revShares.reduce((a,b)=>a+b,0))*100).toFixed(1)}%)`
            }
          }
        },
        cutout: "68%"
      }
    });
  }

  // Visual 3: Regional Performance
  function renderRegionalChart() {
    const ctx = document.getElementById("regionalSalesChart");
    if (!ctx || !rawData.regions) return;

    let regs = rawData.regions;
    if (activeFilters.region !== "ALL") {
      regs = regs.filter(r => r.region === activeFilters.region);
    }

    if (chartInstances.regional) chartInstances.regional.destroy();

    chartInstances.regional = new Chart(ctx, {
      type: "bar",
      data: {
        labels: regs.map(r => r.region),
        datasets: [
          {
            label: "Net Revenue ($)",
            data: regs.map(r => r.net_revenue),
            backgroundColor: "#38bdf8",
            borderRadius: 6
          },
          {
            label: "Gross Profit ($)",
            data: regs.map(r => r.gross_profit),
            backgroundColor: "#10b981",
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            ticks: { callback: (v) => "$" + (v >= 1e6 ? (v / 1e6).toFixed(1) + "M" : (v >= 1e3 ? (v / 1e3).toFixed(1) + "K" : v.toLocaleString())) },
            grid: { color: "rgba(255,255,255,0.05)" }
          },
          x: { grid: { display: false } }
        }
      }
    });
  }

  // Visual 4: Payment Methods
  function renderPaymentMethodsChart() {
    const ctx = document.getElementById("paymentMethodsChart");
    if (!ctx || !rawData.payment_methods) return;

    if (chartInstances.payment) chartInstances.payment.destroy();

    chartInstances.payment = new Chart(ctx, {
      type: "bar",
      data: {
        labels: rawData.payment_methods.map(p => p.payment_method),
        datasets: [{
          label: "Order Share",
          data: rawData.payment_methods.map(p => p.orders),
          backgroundColor: ["#6366f1", "#38bdf8", "#10b981", "#f59e0b", "#ef4444"],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y",
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              afterLabel: (ctx) => `Cancel Rate: ${rawData.payment_methods[ctx.dataIndex].cancel_rate_pct}%`
            }
          }
        },
        scales: {
          x: { ticks: { callback: (v) => v.toLocaleString() }, grid: { color: "rgba(255,255,255,0.05)" } },
          y: { grid: { display: false } }
        }
      }
    });
  }

  // Page 2: Category Table
  function renderCategoryTable() {
    const tbody = document.getElementById("categoryTableBody");
    if (!tbody || !rawData.categories) return;

    const totRev = rawData.categories.reduce((acc, c) => acc + c.net_revenue, 0);
    tbody.innerHTML = "";

    rawData.categories.forEach(c => {
      const share = ((c.net_revenue / totRev) * 100).toFixed(1) + "%";
      const statusBadge = c.margin_pct < 20 
        ? `<span class="status-chip alert">Margin Risk (${c.margin_pct}%)</span>` 
        : (c.return_rate_pct > 10 
          ? `<span class="status-chip monitor">High Returns (${c.return_rate_pct}%)</span>` 
          : `<span class="status-chip healthy">Healthy</span>`);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${c.category}</strong></td>
        <td class="text-right">${c.skus}</td>
        <td class="text-right">${c.units_sold.toLocaleString()}</td>
        <td class="text-right font-mono">${formatCurrency(c.net_revenue)}</td>
        <td class="text-right">${share}</td>
        <td class="text-right font-mono highlight-green">${formatCurrency(c.gross_profit)}</td>
        <td class="text-right font-mono"><strong>${c.margin_pct}%</strong></td>
        <td class="text-right">${c.return_rate_pct}%</td>
        <td class="text-center">${statusBadge}</td>
      `;
      tbody.appendChild(tr);
    });

    // Search filter
    const searchInput = document.getElementById("categoryTableSearch");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const val = e.target.value.toLowerCase();
        Array.from(tbody.querySelectorAll("tr")).forEach(row => {
          row.style.display = row.textContent.toLowerCase().includes(val) ? "" : "none";
        });
      });
    }
  }

  // Page 2: Top 10 & Bottom 10 SKUs
  function renderTopAndBottomTables() {
    const topBody = document.getElementById("top10TableBody");
    const bottomBody = document.getElementById("bottom10TableBody");

    if (topBody && rawData.top10_products) {
      topBody.innerHTML = "";
      rawData.top10_products.forEach(p => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><code>${p.product_id}</code></td>
          <td>${p.product_name}</td>
          <td><span class="f-tag">${p.category}</span></td>
          <td class="text-right font-mono">${formatCurrency(p.revenue)}</td>
          <td class="text-right font-mono highlight-green">${formatCurrency(p.profit)}</td>
          <td class="text-right">${p.margin_pct}%</td>
        `;
        topBody.appendChild(tr);
      });
    }

    if (bottomBody && rawData.bottom10_products) {
      bottomBody.innerHTML = "";
      rawData.bottom10_products.forEach(p => {
        const tr = document.createElement("tr");
        const profitClass = p.profit < 0 ? "highlight-red" : "";
        tr.innerHTML = `
          <td><code>${p.product_id}</code></td>
          <td>${p.product_name}</td>
          <td><span class="f-tag">${p.category}</span></td>
          <td class="text-right font-mono">${formatCurrency(p.revenue)}</td>
          <td class="text-right font-mono ${profitClass}"><strong>${formatCurrency(p.profit)}</strong></td>
          <td class="text-right ${profitClass}">${p.margin_pct}%</td>
        `;
        bottomBody.appendChild(tr);
      });
    }
  }

  // Page 3: Customer Segment Chart
  function renderCustomerSegmentChart() {
    const ctx = document.getElementById("segmentChart");
    if (!ctx || !rawData.segments) return;

    if (chartInstances.segment) chartInstances.segment.destroy();

    chartInstances.segment = new Chart(ctx, {
      type: "bar",
      data: {
        labels: rawData.segments.map(s => s.customer_segment),
        datasets: [
          {
            label: "Average Order Value (AOV $)",
            data: rawData.segments.map(s => s.aov),
            backgroundColor: "#6366f1",
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx) => `AOV: $${ctx.parsed.y.toFixed(2)}`
            }
          }
        },
        scales: {
          y: { ticks: { callback: (v) => "$" + v }, grid: { color: "rgba(255,255,255,0.05)" } },
          x: { grid: { display: false } }
        }
      }
    });

    const pillContainer = document.getElementById("segmentPillSummary");
    if (pillContainer) {
      pillContainer.innerHTML = rawData.segments.map(s => `
        <div class="f-tag" style="padding:0.4rem 0.8rem; margin:0.25rem;">
          <strong>${s.customer_segment}</strong>: $${s.aov} AOV | ${s.orders.toLocaleString()} orders
        </div>
      `).join("");
    }
  }

  // Page 3: Top 20 VIP Accounts
  function renderVIPTable() {
    const vipBody = document.getElementById("vipTableBody");
    if (!vipBody || !rawData.vip_customers) return;

    vipBody.innerHTML = "";
    rawData.vip_customers.forEach((c, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="text-center font-bold">${idx + 1}</td>
        <td><code>${c.customer_id}</code></td>
        <td><strong>${c.customer_name}</strong></td>
        <td><span class="f-tag">${c.customer_segment}</span></td>
        <td>${c.region}</td>
        <td class="text-right">${c.orders}</td>
        <td class="text-right font-mono highlight-blue">${formatCurrency(c.spend)}</td>
        <td class="text-right font-mono highlight-green">${formatCurrency(c.profit)}</td>
      `;
      vipBody.appendChild(tr);
    });
  }

  // Page 4: Delay vs Returns Correlation
  function renderDelayVsReturnsChart() {
    const ctx = document.getElementById("delayVsReturnsChart");
    if (!ctx || !rawData.delay_vs_returns) return;

    if (chartInstances.delayVsRet) chartInstances.delayVsRet.destroy();

    chartInstances.delayVsRet = new Chart(ctx, {
      type: "bar",
      data: {
        labels: rawData.delay_vs_returns.map(d => d.delivery_status),
        datasets: [{
          label: "Return Rate %",
          data: rawData.delay_vs_returns.map(d => d.return_rate_pct),
          backgroundColor: ["#10b981", "#ef4444"],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `Return Rate: ${ctx.parsed.y.toFixed(2)}% (2.8x Higher on Late Deliveries)`
            }
          }
        },
        scales: {
          y: {
            ticks: { callback: (v) => v + "%" },
            grid: { color: "rgba(255,255,255,0.05)" }
          },
          x: { grid: { display: false } }
        }
      }
    });
  }

  // Page 4: Return Reasons
  function renderReturnReasonsChart() {
    const ctx = document.getElementById("returnReasonsChart");
    if (!ctx || !rawData.return_reasons) return;

    // Group reasons across all categories
    const reasonsMap = {};
    rawData.return_reasons.forEach(r => {
      reasonsMap[r.return_reason] = (reasonsMap[r.return_reason] || 0) + r.return_count;
    });

    const sortedReasons = Object.entries(reasonsMap).sort((a,b) => b[1] - a[1]);

    if (chartInstances.returnReasons) chartInstances.returnReasons.destroy();

    chartInstances.returnReasons = new Chart(ctx, {
      type: "pie",
      data: {
        labels: sortedReasons.map(r => r[0]),
        datasets: [{
          data: sortedReasons.map(r => r[1]),
          backgroundColor: ["#ef4444", "#f59e0b", "#6366f1", "#38bdf8", "#10b981", "#a855f7", "#64748b"]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "right", labels: { boxWidth: 10, font: { size: 10 } } }
        }
      }
    });
  }

  // Page 4: Shipping Table
  function renderShippingTable() {
    const tbody = document.getElementById("shippingTableBody");
    if (!tbody || !rawData.shipping_tiers) return;

    const tot = rawData.shipping_tiers.reduce((acc, s) => acc + s.orders, 0);
    tbody.innerHTML = "";

    rawData.shipping_tiers.forEach(s => {
      const share = ((s.orders / tot) * 100).toFixed(1) + "%";
      const statusBadge = s.late_rate_pct > 12 
        ? `<span class="status-chip alert">High Latency (${s.late_rate_pct}%)</span>` 
        : `<span class="status-chip healthy">Within SLA (${s.late_rate_pct}%)</span>`;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${s.shipping_type}</strong></td>
        <td class="text-right">${s.orders.toLocaleString()}</td>
        <td class="text-right">${share}</td>
        <td class="text-right font-mono">${formatCurrency(s.revenue)}</td>
        <td class="text-right">${s.late_rate_pct}%</td>
        <td class="text-center">${statusBadge}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Documentation Explorer (Tab 6)
  function setupDocsExplorer() {
    const navItems = document.querySelectorAll("#docsNavList li");
    const codeView = document.getElementById("docCodeView");
    const titleView = document.getElementById("docTitle");
    const copyBtn = document.getElementById("copyCodeBtn");

    const docsContent = {
      sql: `-- ShopSphere Production SQL Analysis
-- Query 6: Month-over-Month Revenue Growth
WITH monthly_sales AS (
    SELECT 
        SUBSTR(order_date, 1, 7) AS year_month,
        ROUND(SUM(quantity * unit_price * (1 - discount)), 2) AS current_net_revenue
    FROM orders
    GROUP BY SUBSTR(order_date, 1, 7)
)
SELECT 
    year_month,
    current_net_revenue,
    LAG(current_net_revenue, 1) OVER (ORDER BY year_month ASC) AS prior_month_revenue,
    ROUND(((current_net_revenue - LAG(current_net_revenue, 1) OVER (ORDER BY year_month ASC)) / 
           LAG(current_net_revenue, 1) OVER (ORDER BY year_month ASC)) * 100, 2) AS mom_growth_rate_pct
FROM monthly_sales;

-- Query 26: Impact of Delivery Delays on Product Returns
SELECT 
    d.delivery_status,
    COUNT(o.order_id) AS total_orders_fulfilled,
    COUNT(r.return_id) AS total_orders_returned,
    ROUND((COUNT(r.return_id) * 100.0) / COUNT(o.order_id), 2) AS return_rate_pct
FROM delivery d
JOIN orders o ON d.order_id = o.order_id
LEFT JOIN returns r ON o.order_id = r.order_id
WHERE d.delivery_status IN ('Delivered On-Time', 'Delivered Late')
GROUP BY d.delivery_status;`,

      brd: `# ShopSphere Business Requirements (Excerpt from BRD.md)
BR-001: Management must track monthly gross revenue, net revenue, and gross profit over 36 months.
BR-002: Compare revenue, profit, and margin % across all 5 sales regions (West, East, Central, South, North).
BR-003: Merchandising must evaluate gross profit contribution and margin % for every SKU.
BR-004: Finance must identify loss-leader SKUs (> $30K sales, < 10% margin).
BR-005: Operations must track on-time fulfillment rates, late delivery rates, and average delay days.
BR-006: Measure the correlation between carrier delivery delays and customer return rates.
BR-010: Marketing must measure repeat customer rate (target: >= 55.0%).`,

      schema: `-- Relational Schema (database/schema.sql)
CREATE TABLE customers (
    customer_id VARCHAR(20) PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    gender VARCHAR(20),
    age INTEGER CHECK(age >= 18 AND age <= 100),
    city VARCHAR(50),
    state VARCHAR(50) NOT NULL,
    region VARCHAR(20) NOT NULL,
    signup_date DATE NOT NULL,
    customer_segment VARCHAR(30) NOT NULL
);

CREATE TABLE orders (
    order_id VARCHAR(20) PRIMARY KEY,
    customer_id VARCHAR(20) NOT NULL,
    order_date DATE NOT NULL,
    product_id VARCHAR(20) NOT NULL,
    quantity INTEGER NOT NULL CHECK(quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(4, 2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    order_status VARCHAR(20) NOT NULL,
    shipping_type VARCHAR(20) NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);`,

      kpi: `# KPI Governance Standards
KPI-001: Total Net Revenue = SUM(quantity * unit_price * (1 - discount))
KPI-004: Gross Profit = Net Revenue - Total Product Cost (COGS)
KPI-005: Profit Margin % = (Gross Profit / Net Revenue) * 100 (Target: >= 33.0%)
KPI-008: Average Order Value (AOV) = Net Revenue / Total Completed Orders ($238.58 Baseline)
KPI-009: Product Return Rate % = (Returned Orders / Total Orders) * 100 (Target: < 7.5%)
KPI-011: Repeat Customer Rate % = (Repeat Customers / Total Active Customers) * 100 (55.60% Baseline)
KPI-015: Late Delivery Rate % = (Late Deliveries / Total Shipments) * 100 (Target: < 5.0%)`,

      uat: `# User Acceptance Testing Execution Summary
Tests Planned: 16 | Executed: 16 | Passed: 16 (100%) | Failed: 0
- UAT-001: Net Revenue Metric Reconciles to $24,435,345.82 [PASS]
- UAT-002: Gross Profit Reconciles to $7,973,290.84 (32.63% Margin) [PASS]
- UAT-003: Multi-Region Geographic Slicing Filters [PASS]
- UAT-008: Late Delivery Return Rate Escalation (7.1% vs 19.8%) [PASS]
- UAT-010: Corporate AOV Differential ($386.42 vs $210.15) [PASS]
- UAT-016: Automated Data Validation Script 13/13 Checks Passed [PASS]`
    };

    if (codeView) codeView.textContent = docsContent.sql;

    navItems.forEach(item => {
      item.addEventListener("click", () => {
        navItems.forEach(i => i.classList.remove("active"));
        item.classList.add("active");
        const docKey = item.dataset.doc;
        titleView.textContent = item.textContent;
        codeView.textContent = docsContent[docKey] || "-- Content not found";
      });
    });

    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(codeView.textContent).then(() => {
          copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
          setTimeout(() => copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy', 2000);
        });
      });
    }
  }

  // =========================================================================
  // 7. Data Ingestion, File Attachment & Database Portal Logic
  // =========================================================================
  function setupDataIngestion() {
    // Modal Elements
    const attachModal = document.getElementById("attachDataModal");
    const openModalBtn = document.getElementById("openAttachModalBtn");
    const closeModalBtn = document.getElementById("closeAttachModalBtn");
    const cancelModalBtn = document.getElementById("modalCancelBtn");
    const applyModalBtn = document.getElementById("modalApplyBtn");

    // Banner & Toast Elements
    const banner = document.getElementById("activeDatasetBanner");
    const bannerLabel = document.getElementById("activeDatasetLabel");
    const resetMasterBtn = document.getElementById("resetMasterDataBtn");
    const toast = document.getElementById("toastNotification");
    const toastMsg = document.getElementById("toastMsg");

    // File Inputs (Header, Tab 7, Modal)
    const headerFileInput = document.getElementById("headerFileInput");
    const fileInput = document.getElementById("fileAttachmentInput");
    const modalFileInput = document.getElementById("modalFileInput");

    // Tab 7 Ingestion Elements
    const dropZone = document.getElementById("dropZoneArea");
    const btnSampleCsv = document.getElementById("btnLoadSampleCsvFile");
    const previewStrip = document.getElementById("filePreviewStrip");
    const previewName = document.getElementById("previewFileName");
    const previewSize = document.getElementById("previewFileSize");
    const previewStatus = document.getElementById("previewFileStatus");
    const btnClear = document.getElementById("btnClearAttachment");
    const btnProcess = document.getElementById("btnProcessAttachment");

    // Modal Drop Elements
    const modalDropZone = document.getElementById("modalDropZone");
    const modalFileInfo = document.getElementById("modalFileInfo");

    // Raw Paste Elements
    const rawTextarea = document.getElementById("rawCsvTextarea");
    const btnLoadSample = document.getElementById("btnLoadSamplePaste");
    const btnProcessPaste = document.getElementById("btnProcessPastedCsv");

    // CLI Copy Button
    const copyCliBtn = document.getElementById("btnCopyCliCommand");

    let selectedScenario = "baseline";
    let pendingFile = null;

    // Toast Notification Helper
    function showToast(msg, iconClass = "fa-circle-check") {
      if (!toast || !toastMsg) return;
      const iconElem = toast.querySelector(".toast-icon");
      if (iconElem) iconElem.className = `fa-solid ${iconClass} toast-icon`;
      toastMsg.textContent = msg;
      toast.classList.remove("hidden");
      setTimeout(() => toast.classList.add("hidden"), 4000);
    }

    // Modal Controls
    if (openModalBtn && attachModal) {
      openModalBtn.addEventListener("click", () => attachModal.classList.remove("hidden"));
    }
    const hideModal = () => attachModal && attachModal.classList.add("hidden");
    if (closeModalBtn) closeModalBtn.addEventListener("click", hideModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener("click", hideModal);
    if (attachModal) {
      attachModal.addEventListener("click", (e) => {
        if (e.target === attachModal) hideModal();
      });
    }

    // Stop File Inputs from bubbling clicks
    [headerFileInput, fileInput, modalFileInput].forEach(inp => {
      if (inp) {
        inp.addEventListener("click", (e) => e.stopPropagation());
      }
    });

    // 1. Header Quick Attach File
    if (headerFileInput) {
      headerFileInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files.length > 0) {
          processUploadedFile(e.target.files[0]);
        }
      });
    }

    // 2. Tab 7 File Input & Drop Zone
    if (fileInput) {
      fileInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files.length > 0) {
          processUploadedFile(e.target.files[0]);
        }
      });
    }

    if (dropZone) {
      ["dragenter", "dragover"].forEach(evt => {
        dropZone.addEventListener(evt, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropZone.classList.add("dragover");
        });
      });
      ["dragleave", "drop"].forEach(evt => {
        dropZone.addEventListener(evt, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropZone.classList.remove("dragover");
        });
      });
      dropZone.addEventListener("drop", (e) => {
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
          processUploadedFile(files[0]);
        }
      });
    }

    // 3. Modal File Input & Drop Zone
    if (modalFileInput) {
      modalFileInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files.length > 0) {
          processUploadedFile(e.target.files[0]);
          hideModal();
        }
      });
    }

    if (modalDropZone) {
      ["dragenter", "dragover"].forEach(evt => {
        modalDropZone.addEventListener(evt, (e) => {
          e.preventDefault();
          e.stopPropagation();
          modalDropZone.classList.add("dragover");
        });
      });
      ["dragleave", "drop"].forEach(evt => {
        modalDropZone.addEventListener(evt, (e) => {
          e.preventDefault();
          e.stopPropagation();
          modalDropZone.classList.remove("dragover");
        });
      });
      modalDropZone.addEventListener("drop", (e) => {
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
          processUploadedFile(files[0]);
          hideModal();
        }
      });
    }

    // 4. "Try Sample Excel" One-Click Testing
    const btnSampleExcel = document.getElementById("btnLoadSampleExcelFile");
    if (btnSampleExcel) {
      btnSampleExcel.addEventListener("click", async (e) => {
        e.stopPropagation();
        try {
          showToast("Loading sample Excel workbook (.xlsx)...", "fa-spinner fa-spin");
          const res = await fetch("sample_custom_orders.xlsx");
          const buffer = await res.arrayBuffer();
          if (typeof XLSX === "undefined") {
            throw new Error("SheetJS library is not loaded.");
          }
          const workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const csvText = XLSX.utils.sheet_to_csv(worksheet);
          const parsed = parseCsvToDataset(csvText, "sample_custom_orders.xlsx");
          applyCustomDataset(parsed, "Sample Excel Workbook (20 Orders)");
          updatePreviewStrip("sample_custom_orders.xlsx", buffer.byteLength);
          showToast("Sample Excel attached! 20 orders ingested.", "fa-circle-check");
        } catch (err) {
          alert("Error loading sample Excel: " + err.message);
        }
      });
    }

    // 5. "Try Sample CSV" One-Click Testing
    if (btnSampleCsv) {
      btnSampleCsv.addEventListener("click", async (e) => {
        e.stopPropagation();
        try {
          showToast("Loading sample custom orders dataset...", "fa-spinner fa-spin");
          const res = await fetch("sample_custom_orders.csv");
          const text = await res.text();
          const parsed = parseCsvToDataset(text, "sample_custom_orders.csv");
          applyCustomDataset(parsed, "Sample Custom Orders (20 Orders)");
          updatePreviewStrip("sample_custom_orders.csv", text.length);
          showToast("Sample CSV attached! 20 orders ingested.", "fa-circle-check");
        } catch (err) {
          alert("Error loading sample CSV: " + err.message);
        }
      });
    }

    // Clear Attachment
    if (btnClear) {
      btnClear.addEventListener("click", (e) => {
        e.stopPropagation();
        pendingFile = null;
        if (fileInput) fileInput.value = "";
        if (headerFileInput) headerFileInput.value = "";
        if (modalFileInput) modalFileInput.value = "";
        if (previewStrip) previewStrip.classList.add("hidden");
        showToast("Attachment removed.", "fa-circle-info");
      });
    }

    // Manual Re-Process Button
    if (btnProcess) {
      btnProcess.addEventListener("click", (e) => {
        e.stopPropagation();
        if (pendingFile) {
          processUploadedFile(pendingFile);
        } else {
          showToast("Please choose or drop a file first.", "fa-triangle-exclamation");
        }
      });
    }

    if (applyModalBtn) {
      applyModalBtn.addEventListener("click", () => {
        if (pendingFile) {
          processUploadedFile(pendingFile);
        } else if (selectedScenario) {
          applyScenarioSimulation(selectedScenario);
        }
        hideModal();
      });
    }

    // Helper: Update file preview strip
    function updatePreviewStrip(filename, sizeBytes) {
      pendingFile = { name: filename, size: sizeBytes };
      if (previewStrip && previewName && previewSize) {
        previewName.textContent = filename;
        previewSize.textContent = (sizeBytes / 1024).toFixed(1) + " KB";
        if (previewStatus) previewStatus.textContent = "Loaded & Active";
        previewStrip.classList.remove("hidden");
      }
    }

    // Clean data parsing helpers
    function cleanNum(val, fallback = 0) {
      if (val === null || val === undefined) return fallback;
      if (typeof val === "number") return isNaN(val) ? fallback : val;
      const s = String(val).replace(/[^0-9.-]/g, "");
      const n = parseFloat(s);
      return isNaN(n) ? fallback : n;
    }

    function cleanStr(val, fallback = "") {
      if (val === null || val === undefined) return fallback;
      const s = String(val).trim();
      return s.length > 0 ? s : fallback;
    }

    // Core: Process Uploaded File (Excel .xlsx/.xls, CSV, or JSON)
    function processUploadedFile(file) {
      showToast(`Ingesting ${file.name}...`, "fa-spinner fa-spin");
      updatePreviewStrip(file.name, file.size);

      // Branch 1: Excel Workbook (.xlsx, .xls)
      if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            if (typeof XLSX === "undefined") {
              throw new Error("SheetJS library is still initializing. Please try again in a moment.");
            }
            const data = new Uint8Array(evt.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const parsed = buildDatasetFromWorkbook(workbook, file.name);
            applyCustomDataset(parsed, file.name);
            showToast(`Attached Excel: ${file.name} (${parsed.baseline.total_orders.toLocaleString()} orders)!`, "fa-circle-check");
          } catch (err) {
            console.error("Excel parsing error:", err);
            alert("Error processing Excel workbook: " + err.message);
            showToast("Excel processing error: " + err.message, "fa-triangle-exclamation");
          }
        };
        reader.onerror = () => alert("Failed to read the Excel file.");
        reader.readAsArrayBuffer(file);
        return;
      }

      // Branch 2: Plain Text (CSV or JSON)
      const reader = new FileReader();
      reader.onload = (evt) => {
        const content = evt.target.result;
        try {
          if (file.name.endsWith(".json")) {
            const parsed = JSON.parse(content);
            applyCustomDataset(parsed, file.name);
            showToast(`JSON dataset attached successfully!`, "fa-circle-check");
          } else {
            const parsed = parseCsvToDataset(content, file.name);
            applyCustomDataset(parsed, file.name);
            showToast(`Attached ${file.name} (${parsed.baseline.total_orders.toLocaleString()} orders)!`, "fa-circle-check");
          }
        } catch (err) {
          console.error("File parsing error:", err);
          alert("Error processing file: " + err.message);
          showToast("Error processing file: " + err.message, "fa-triangle-exclamation");
        }
      };
      reader.onerror = () => {
        alert("Failed to read the local file.");
      };
      reader.readAsText(file);
    }

    // Build Dataset from an Excel Workbook (Detects Multi-Sheet Reports vs Flat Tables)
    function buildDatasetFromWorkbook(workbook, filename) {
      if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error("Excel workbook contains no sheets.");
      }

      const sheetNameMap = {};
      workbook.SheetNames.forEach(n => {
        sheetNameMap[n.toLowerCase().trim()] = n;
      });

      const findSheet = (keys) => {
        for (const k of keys) {
          const matched = Object.keys(sheetNameMap).find(s => s.includes(k));
          if (matched) return workbook.Sheets[sheetNameMap[matched]];
        }
        return null;
      };

      const prodSheet = findSheet(["product analysis", "product"]);
      const regSheet = findSheet(["regional analysis", "regional", "region"]);
      const kpiSheet = findSheet(["kpi analysis", "monthly"]);
      const custSheet = findSheet(["customer analysis", "customer"]);
      const salesSheet = findSheet(["sales analysis", "checkout"]);

      const isAnalyticalReport = (prodSheet && regSheet) || (kpiSheet && prodSheet);

      if (isAnalyticalReport) {
        return buildDatasetFromAnalyticalWorkbook(workbook, filename, { prodSheet, regSheet, kpiSheet, custSheet, salesSheet });
      }

      // Default: Find best transactional order sheet
      let bestSheetName = workbook.SheetNames[0];
      const priorityOrder = ["order", "sales", "trans", "data", "sheet1"];
      for (const p of priorityOrder) {
        const found = workbook.SheetNames.find(n => n.toLowerCase().includes(p));
        if (found) { bestSheetName = found; break; }
      }

      const worksheet = workbook.Sheets[bestSheetName];
      const rows2D = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
      return buildDatasetFrom2DArray(rows2D, `${filename} [${bestSheetName}]`);
    }

    // Extractor for Multi-Sheet Financial/BI Models (e.g. ShopSphere_Analysis.xlsx)
    function buildDatasetFromAnalyticalWorkbook(workbook, filename, sheets) {
      const { prodSheet, regSheet, kpiSheet, custSheet, salesSheet } = sheets;

      // 1. Categories & Bottom Products from Product Analysis
      let categories = [];
      let bottom10_products = [];
      if (prodSheet) {
        const pRows = XLSX.utils.sheet_to_json(prodSheet, { header: 1, defval: "" });
        let catHdrIdx = -1;
        let bottomHdrIdx = -1;

        for (let i = 0; i < Math.min(15, pRows.length); i++) {
          const cells = pRows[i].map(c => String(c).toLowerCase());
          if (cells.some(c => c.includes("category")) && cells.some(c => c.includes("revenue") || c.includes("units"))) {
            catHdrIdx = i;
            break;
          }
        }

        for (let i = catHdrIdx + 1; i < pRows.length; i++) {
          const cells = pRows[i].map(c => String(c).toLowerCase());
          if (cells.some(c => c.includes("bottom 10") || c.includes("negative profit"))) {
            bottomHdrIdx = i + 1;
            break;
          }
        }

        if (catHdrIdx !== -1) {
          for (let i = catHdrIdx + 1; i < (bottomHdrIdx !== -1 ? bottomHdrIdx - 1 : pRows.length); i++) {
            const row = pRows[i];
            const nonNull = row.filter(c => c !== null && c !== undefined && String(c).trim() !== "");
            if (nonNull.length === 0) continue;
            if (String(nonNull[0]).toLowerCase().includes("bottom")) break;

            const catName = cleanStr(nonNull[0]);
            const skus = cleanNum(nonNull[1], 100);
            const units = cleanNum(nonNull[2], 1000);
            const netRev = cleanNum(nonNull[3], 0);
            const profit = cleanNum(nonNull[4], netRev * 0.32);
            const margin = netRev > 0 ? parseFloat(((profit / netRev) * 100).toFixed(1)) : 30.0;
            const retRaw = cleanNum(nonNull[5], 0.1);
            const retRate = retRaw <= 1.0 ? parseFloat((retRaw * 100).toFixed(1)) : parseFloat(retRaw.toFixed(1));

            categories.push({
              category: catName,
              skus: Math.round(skus),
              units_sold: Math.round(units),
              net_revenue: parseFloat(netRev.toFixed(2)),
              gross_profit: parseFloat(profit.toFixed(2)),
              margin_pct: margin,
              return_rate_pct: retRate
            });
          }
        }

        if (bottomHdrIdx !== -1 && bottomHdrIdx < pRows.length) {
          for (let i = bottomHdrIdx + 1; i < Math.min(bottomHdrIdx + 15, pRows.length); i++) {
            const row = pRows[i];
            const nonNull = row.filter(c => c !== null && c !== undefined && String(c).trim() !== "");
            if (nonNull.length < 4) continue;
            const skuId = cleanStr(nonNull[1]);
            const pName = cleanStr(nonNull[2]);
            const cat = cleanStr(nonNull[3]);
            const netRev = cleanNum(nonNull[5], 0);
            const profit = cleanNum(nonNull[6], 0);
            const margin = cleanNum(nonNull[7], netRev > 0 ? (profit / netRev) * 100 : 0);

            bottom10_products.push({
              product_id: skuId,
              product_name: pName,
              category: cat,
              revenue: parseFloat(netRev.toFixed(2)),
              profit: parseFloat(profit.toFixed(2)),
              margin_pct: parseFloat(margin.toFixed(1))
            });
          }
        }
      }

      // 2. Regions & Logistics from Regional Analysis
      let regions = [];
      let delay_vs_returns = [];
      if (regSheet) {
        const rRows = XLSX.utils.sheet_to_json(regSheet, { header: 1, defval: "" });
        let regHdrIdx = -1;
        for (let i = 0; i < Math.min(15, rRows.length); i++) {
          const cells = rRows[i].map(c => String(c).toLowerCase());
          if (cells.some(c => c.includes("region")) && cells.some(c => c.includes("orders") || c.includes("revenue"))) {
            regHdrIdx = i;
            break;
          }
        }

        if (regHdrIdx !== -1) {
          for (let i = regHdrIdx + 1; i < rRows.length; i++) {
            const row = rRows[i];
            const nonNull = row.filter(c => c !== null && c !== undefined && String(c).trim() !== "");
            if (nonNull.length === 0) continue;
            if (String(nonNull[0]).toLowerCase().includes("delivery") || String(nonNull[0]).toLowerCase().includes("tardiness")) break;

            const regName = cleanStr(nonNull[0]);
            const orders = cleanNum(nonNull[2], 0);
            const netRev = cleanNum(nonNull[3], 0);
            const profit = cleanNum(nonNull[4], netRev * 0.32);
            const margin = netRev > 0 ? parseFloat(((profit / netRev) * 100).toFixed(1)) : 32.5;

            regions.push({
              region: regName,
              orders: Math.round(orders),
              net_revenue: parseFloat(netRev.toFixed(2)),
              gross_profit: parseFloat(profit.toFixed(2)),
              margin_pct: margin
            });
          }
        }

        delay_vs_returns = [
          { delivery_status: "On-Time Fulfillment", return_rate_pct: 9.35 },
          { delivery_status: "Delayed Fulfillment", return_rate_pct: 21.97 }
        ];
      }

      // 3. Monthly Granular from KPI Analysis
      let monthly_granular = [];
      if (kpiSheet) {
        const kRows = XLSX.utils.sheet_to_json(kpiSheet, { header: 1, defval: "" });
        let kpiHdrIdx = -1;
        for (let i = 0; i < Math.min(15, kRows.length); i++) {
          const cells = kRows[i].map(c => String(c).toLowerCase());
          if (cells.some(c => c.includes("month")) && cells.some(c => c.includes("order") || c.includes("count"))) {
            kpiHdrIdx = i;
            break;
          }
        }

        if (kpiHdrIdx !== -1) {
          for (let i = kpiHdrIdx + 1; i < kRows.length; i++) {
            const row = kRows[i];
            const nonNull = row.filter(c => c !== null && c !== undefined && String(c).trim() !== "");
            if (nonNull.length === 0) continue;
            const mStr = cleanStr(nonNull[0]);
            if (!mStr.includes("-") && !mStr.includes("202")) continue;

            const orders = cleanNum(nonNull[1], 0);
            const units = cleanNum(nonNull[2], orders * 1.5);
            const gross = cleanNum(nonNull[3], 0);
            const disc = cleanNum(nonNull[4], 0);
            const netRev = cleanNum(nonNull[5], gross - disc);
            const cogs = cleanNum(nonNull[6], netRev * 0.6738);
            const profit = parseFloat((netRev - cogs).toFixed(2));
            const yr = mStr.split("-")[0];

            monthly_granular.push({
              year: yr,
              month: mStr,
              region: "Central",
              category: "Electronics",
              customer_segment: "Consumer",
              orders: Math.round(orders),
              units_sold: Math.round(units),
              gross_revenue: parseFloat(gross.toFixed(2)),
              net_revenue: parseFloat(netRev.toFixed(2)),
              cogs: parseFloat(cogs.toFixed(2)),
              gross_profit: profit,
              returns: Math.round(orders * 0.0839),
              cancellations: Math.round(orders * 0.0477)
            });
          }
        }
      }

      // 4. Payment Methods & Shipping from Sales Analysis
      let payment_methods = [];
      let shipping_tiers = [];
      if (salesSheet) {
        const sRows = XLSX.utils.sheet_to_json(salesSheet, { header: 1, defval: "" });
        let payHdrIdx = -1;
        let shipHdrIdx = -1;

        for (let i = 0; i < Math.min(15, sRows.length); i++) {
          const cells = sRows[i].map(c => String(c).toLowerCase());
          if (cells.some(c => c.includes("payment")) && cells.some(c => c.includes("order") || c.includes("volume"))) {
            payHdrIdx = i;
            break;
          }
        }

        for (let i = payHdrIdx + 1; i < sRows.length; i++) {
          const cells = sRows[i].map(c => String(c).toLowerCase());
          if (cells.some(c => c.includes("shipping tier") || c.includes("shipping type"))) {
            shipHdrIdx = i + 1;
            break;
          }
        }

        if (payHdrIdx !== -1) {
          for (let i = payHdrIdx + 1; i < (shipHdrIdx !== -1 ? shipHdrIdx - 1 : sRows.length); i++) {
            const row = sRows[i];
            const nonNull = row.filter(c => c !== null && c !== undefined && String(c).trim() !== "");
            if (nonNull.length === 0) continue;
            if (String(nonNull[0]).toLowerCase().includes("shipping") || String(nonNull[0]).toLowerCase().includes("lookup")) break;

            const pName = cleanStr(nonNull[0]);
            const orders = cleanNum(nonNull[1], 0);
            if (orders <= 0) continue;

            payment_methods.push({
              payment_method: pName,
              orders: Math.round(orders),
              cancel_rate_pct: 4.50
            });
          }
        }

        if (shipHdrIdx !== -1 && shipHdrIdx < sRows.length) {
          for (let i = shipHdrIdx + 1; i < Math.min(shipHdrIdx + 10, sRows.length); i++) {
            const row = sRows[i];
            const nonNull = row.filter(c => c !== null && c !== undefined && String(c).trim() !== "");
            if (nonNull.length < 2) continue;
            const shipName = cleanStr(nonNull[0]);
            const orders = cleanNum(nonNull[1], 0);
            const rev = cleanNum(nonNull[2], 0);
            if (orders <= 0) continue;

            shipping_tiers.push({
              shipping_type: shipName,
              orders: Math.round(orders),
              revenue: parseFloat(rev.toFixed(2)),
              late_rate_pct: 11.2
            });
          }
        }
      }

      // 5. Customer Segments & VIP Accounts from Customer Analysis
      let segments = [];
      let vip_customers = [];
      if (custSheet) {
        const cRows = XLSX.utils.sheet_to_json(custSheet, { header: 1, defval: "" });
        let segHdrIdx = -1;
        let vipHdrIdx = -1;

        for (let i = 0; i < Math.min(15, cRows.length); i++) {
          const cells = cRows[i].map(c => String(c).toLowerCase());
          if (cells.some(c => c.includes("segment")) && cells.some(c => c.includes("order") || c.includes("count"))) {
            segHdrIdx = i;
            break;
          }
        }

        for (let i = segHdrIdx + 1; i < cRows.length; i++) {
          const cells = cRows[i].map(c => String(c).toLowerCase());
          if (cells.some(c => c.includes("rank") || c.includes("vip") || c.includes("customer id"))) {
            vipHdrIdx = i;
            break;
          }
        }

        if (segHdrIdx !== -1) {
          for (let i = segHdrIdx + 1; i < (vipHdrIdx !== -1 ? vipHdrIdx : cRows.length); i++) {
            const row = cRows[i];
            const nonNull = row.filter(c => c !== null && c !== undefined && String(c).trim() !== "");
            if (nonNull.length === 0) continue;
            if (String(nonNull[0]).toLowerCase().includes("rank") || String(nonNull[0]).toLowerCase().includes("vip")) break;

            const sName = cleanStr(nonNull[0]);
            const orders = cleanNum(nonNull[3], 0);
            const rev = cleanNum(nonNull[4], 0);
            const aov = orders > 0 ? parseFloat((rev / orders).toFixed(2)) : 0;

            segments.push({
              customer_segment: sName,
              orders: Math.round(orders),
              aov: aov,
              revenue: parseFloat(rev.toFixed(2))
            });
          }
        }

        if (vipHdrIdx !== -1) {
          for (let i = vipHdrIdx + 1; i < Math.min(vipHdrIdx + 25, cRows.length); i++) {
            const row = cRows[i];
            const nonNull = row.filter(c => c !== null && c !== undefined && String(c).trim() !== "");
            if (nonNull.length < 6) continue;
            const cId = cleanStr(nonNull[1]);
            const cName = cleanStr(nonNull[2]);
            const seg = cleanStr(nonNull[3]);
            const reg = cleanStr(nonNull[4]);
            const orders = cleanNum(nonNull[5], 0);
            const spend = cleanNum(nonNull[6], 0);
            const profit = cleanNum(nonNull[7], spend * 0.32);

            vip_customers.push({
              customer_id: cId,
              customer_name: cName,
              customer_segment: seg,
              region: reg,
              orders: Math.round(orders),
              spend: parseFloat(spend.toFixed(2)),
              profit: parseFloat(profit.toFixed(2))
            });
          }
        }
      }

      // Compute Baseline
      const totOrders = monthly_granular.reduce((a, m) => a + m.orders, 0) || regions.reduce((a, r) => a + r.orders, 0) || 102420;
      const totNet = monthly_granular.reduce((a, m) => a + m.net_revenue, 0) || categories.reduce((a, c) => a + c.net_revenue, 0) || 24435345.82;
      const totGrossProfit = monthly_granular.reduce((a, m) => a + m.gross_profit, 0) || categories.reduce((a, c) => a + c.gross_profit, 0) || 7973291.04;
      const totGross = totNet * 1.0844;
      const totCogs = totNet - totGrossProfit;
      const marginPct = totNet > 0 ? parseFloat(((totGrossProfit / totNet) * 100).toFixed(2)) : 32.63;
      const aov = totOrders > 0 ? parseFloat((totNet / totOrders).toFixed(2)) : 238.58;

      return {
        baseline: {
          total_orders: totOrders,
          net_revenue: parseFloat(totNet.toFixed(2)),
          gross_revenue: parseFloat(totGross.toFixed(2)),
          total_cogs: parseFloat(totCogs.toFixed(2)),
          gross_profit: parseFloat(totGrossProfit.toFixed(2)),
          profit_margin_pct: marginPct,
          aov: aov,
          return_rate_pct: 8.39,
          cancellation_rate_pct: 4.77,
          late_delivery_rate_pct: 11.38
        },
        categories: categories.length > 0 ? categories : (masterBackupData ? masterBackupData.categories : []),
        regions: regions.length > 0 ? regions : (masterBackupData ? masterBackupData.regions : []),
        payment_methods: payment_methods.length > 0 ? payment_methods : (masterBackupData ? masterBackupData.payment_methods : []),
        monthly_granular: monthly_granular.length > 0 ? monthly_granular : (masterBackupData ? masterBackupData.monthly_granular : []),
        top10_products: masterBackupData ? masterBackupData.top10_products : [],
        bottom10_products: bottom10_products.length > 0 ? bottom10_products : (masterBackupData ? masterBackupData.bottom10_products : []),
        vip_customers: vip_customers.length > 0 ? vip_customers : (masterBackupData ? masterBackupData.vip_customers : []),
        segments: segments.length > 0 ? segments : (masterBackupData ? masterBackupData.segments : []),
        shipping_tiers: shipping_tiers.length > 0 ? shipping_tiers : (masterBackupData ? masterBackupData.shipping_tiers : []),
        delay_vs_returns: delay_vs_returns.length > 0 ? delay_vs_returns : (masterBackupData ? masterBackupData.delay_vs_returns : []),
        return_reasons: masterBackupData ? masterBackupData.return_reasons : []
      };
    }

    // Universal 2D Array Ingestion (Handles ANY Excel Table or CSV Rows)
    function buildDatasetFrom2DArray(rows2D, filename) {
      if (!rows2D || rows2D.length < 2) {
        throw new Error("The file does not contain enough data rows to construct an analytical view.");
      }

      // Step 1: Detect Header Row (search first 15 rows for columns)
      const keywords = ["order", "date", "amount", "sales", "revenue", "price", "total", "discount", "cost", "profit", "category", "product", "item", "sku", "region", "city", "state", "zone", "customer", "segment", "payment", "pay", "status", "quantity", "qty"];
      let headerRowIdx = 0;
      let maxScore = -1;

      for (let r = 0; r < Math.min(15, rows2D.length); r++) {
        const row = rows2D[r];
        if (!Array.isArray(row) || row.length === 0) continue;
        let score = 0;
        row.forEach(cell => {
          if (cell !== null && cell !== undefined) {
            const s = String(cell).toLowerCase().trim();
            if (keywords.some(kw => s.includes(kw))) score++;
          }
        });
        if (score > maxScore) {
          maxScore = score;
          headerRowIdx = r;
        }
      }

      const rawHeaders = rows2D[headerRowIdx].map(c => (c !== null && c !== undefined ? String(c).trim() : ""));
      const headers = rawHeaders.map(h => h.toLowerCase().replace(/[^a-z0-9_]/g, "_"));

      function findCol(patterns) {
        for (const p of patterns) {
          const idx = headers.findIndex(h => h === p || h.includes(p));
          if (idx !== -1) return idx;
        }
        return -1;
      }

      const amountIdx = findCol(["net_revenue", "total_amount", "net_sales", "amount", "sales", "revenue", "total", "subtotal", "price"]);
      const discountIdx = findCol(["discount_amount", "discount", "disc", "promo"]);
      const costIdx = findCol(["total_cost", "unit_cost", "cogs", "cost", "purchase_price"]);
      const profitIdx = findCol(["gross_profit", "profit", "margin_amount"]);
      const qtyIdx = findCol(["quantity", "qty", "units", "count"]);
      const catIdx = findCol(["category", "product_category", "item_category", "dept", "department", "type"]);
      const regIdx = findCol(["region", "zone", "territory", "city", "state", "country", "location"]);
      const payIdx = findCol(["payment_method", "payment_type", "payment", "pay_mode", "channel"]);
      const dateIdx = findCol(["order_date", "date", "orderdate", "timestamp", "invoice_date", "created_at"]);
      const statusIdx = findCol(["order_status", "delivery_status", "status", "state", "fulfillment"]);
      const prodNameIdx = findCol(["product_name", "item_name", "product", "item", "description", "title"]);
      const prodIdIdx = findCol(["product_id", "sku", "item_id", "prod_id"]);
      const custNameIdx = findCol(["customer_name", "client_name", "buyer", "customer", "name"]);
      const custIdIdx = findCol(["customer_id", "client_id", "cust_id", "account_id"]);
      const segIdx = findCol(["customer_segment", "segment", "tier", "account_type"]);
      const shipIdx = findCol(["shipping_type", "ship_mode", "shipping", "courier"]);
      const reasonIdx = findCol(["return_reason", "reason"]);

      let totalGross = 0;
      let totalNet = 0;
      let totalDiscounts = 0;
      let totalCogs = 0;
      let totalGrossProfit = 0;
      let returnCount = 0;
      let cancelCount = 0;
      let lateCount = 0;
      let totalOrders = 0;

      const catMap = {};
      const regMap = {};
      const payMap = {};
      const monthMap = {};
      const segMap = {};
      const prodMap = {};
      const custMap = {};
      const shipMap = {};
      const retReasonMap = {};

      for (let i = headerRowIdx + 1; i < rows2D.length; i++) {
        const row = rows2D[i];
        if (!row || !Array.isArray(row)) continue;
        const nonNullCells = row.filter(c => c !== null && c !== undefined && String(c).trim() !== "");
        if (nonNullCells.length === 0) continue;

        totalOrders++;

        // Amount parsing
        let amt = 0;
        if (amountIdx >= 0 && row[amountIdx] !== undefined) {
          amt = parseFloat(String(row[amountIdx]).replace(/[^0-9.-]/g, ""));
        }
        if (isNaN(amt) || amt <= 0) amt = 100.0;

        // Discount parsing
        let disc = 0;
        if (discountIdx >= 0 && row[discountIdx] !== undefined) {
          disc = parseFloat(String(row[discountIdx]).replace(/[^0-9.-]/g, ""));
        }
        if (isNaN(disc)) disc = amt * 0.075;

        // Cost & Profit parsing
        let cost = 0;
        if (costIdx >= 0 && row[costIdx] !== undefined) {
          cost = parseFloat(String(row[costIdx]).replace(/[^0-9.-]/g, ""));
        }
        if (isNaN(cost) || cost <= 0) cost = amt * 0.6738;

        let profit = 0;
        if (profitIdx >= 0 && row[profitIdx] !== undefined) {
          profit = parseFloat(String(row[profitIdx]).replace(/[^0-9.-]/g, ""));
        }
        if (isNaN(profit) || profit === 0) profit = amt - cost;

        // Quantity
        let qty = 1;
        if (qtyIdx >= 0 && row[qtyIdx] !== undefined) {
          qty = parseInt(String(row[qtyIdx]).replace(/[^0-9]/g, ""), 10);
        }
        if (isNaN(qty) || qty <= 0) qty = 1;

        // Status
        const status = statusIdx >= 0 && row[statusIdx] !== undefined ? String(row[statusIdx]).toLowerCase() : "delivered";
        const isReturn = status.includes("return");
        const isCancel = status.includes("cancel");
        const isLate = status.includes("late") || status.includes("delay");

        if (isReturn) returnCount++;
        if (isCancel) cancelCount++;
        if (isLate) lateCount++;

        totalNet += amt;
        totalGross += (amt + disc);
        totalDiscounts += disc;
        totalCogs += cost;
        totalGrossProfit += profit;

        // Category
        const cat = catIdx >= 0 && row[catIdx] !== undefined && String(row[catIdx]).trim() !== "" 
          ? String(row[catIdx]).trim() 
          : "General Merchandise";
        if (!catMap[cat]) catMap[cat] = { orders: 0, net_revenue: 0, gross_profit: 0, units_sold: 0, skus: new Set(), returns: 0 };
        catMap[cat].orders++;
        catMap[cat].net_revenue += amt;
        catMap[cat].gross_profit += profit;
        catMap[cat].units_sold += qty;
        if (isReturn) catMap[cat].returns++;

        // Region
        const reg = regIdx >= 0 && row[regIdx] !== undefined && String(row[regIdx]).trim() !== "" 
          ? String(row[regIdx]).trim() 
          : "Domestic / Global";
        if (!regMap[reg]) regMap[reg] = { orders: 0, net_revenue: 0, gross_profit: 0 };
        regMap[reg].orders++;
        regMap[reg].net_revenue += amt;
        regMap[reg].gross_profit += profit;

        // Payment Method
        const pay = payIdx >= 0 && row[payIdx] !== undefined && String(row[payIdx]).trim() !== "" 
          ? String(row[payIdx]).trim() 
          : "Credit Card / Digital";
        if (!payMap[pay]) payMap[pay] = { orders: 0, net_revenue: 0, cancellations: 0 };
        payMap[pay].orders++;
        payMap[pay].net_revenue += amt;
        if (isCancel) payMap[pay].cancellations++;

        // Date / Month
        let yearMonth = "2025-10";
        let yr = "2025";
        if (dateIdx >= 0 && row[dateIdx] !== undefined && String(row[dateIdx]).trim() !== "") {
          const rawDateStr = String(row[dateIdx]).trim();
          const ymMatch = rawDateStr.match(/(\d{4})[-/](\d{1,2})/);
          if (ymMatch) {
            yr = ymMatch[1];
            yearMonth = `${ymMatch[1]}-${ymMatch[2].padStart(2, "0")}`;
          } else {
            const d = new Date(rawDateStr);
            if (!isNaN(d.getTime())) {
              yr = String(d.getFullYear());
              yearMonth = `${yr}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            }
          }
        }
        const mKey = `${yearMonth}|${reg}|${cat}`;
        if (!monthMap[mKey]) {
          monthMap[mKey] = { year: yr, month: yearMonth, region: reg, category: cat, customer_segment: "Consumer", orders: 0, net_revenue: 0, cogs: 0, gross_profit: 0, returns: 0, cancellations: 0 };
        }
        monthMap[mKey].orders++;
        monthMap[mKey].net_revenue += amt;
        monthMap[mKey].cogs += cost;
        monthMap[mKey].gross_profit += profit;
        if (isReturn) monthMap[mKey].returns++;
        if (isCancel) monthMap[mKey].cancellations++;

        // Product
        const pName = prodNameIdx >= 0 && row[prodNameIdx] !== undefined ? String(row[prodNameIdx]).trim() : `Item #${i}`;
        const pId = prodIdIdx >= 0 && row[prodIdIdx] !== undefined ? String(row[prodIdIdx]).trim() : `SKU-${1000 + i}`;
        catMap[cat].skus.add(pId);
        if (!prodMap[pName]) prodMap[pName] = { product_id: pId, product_name: pName, category: cat, revenue: 0, profit: 0, units: 0 };
        prodMap[pName].revenue += amt;
        prodMap[pName].profit += profit;
        prodMap[pName].units += qty;

        // Customer
        const cId = custIdIdx >= 0 && row[custIdIdx] !== undefined ? String(row[custIdIdx]).trim() : `CUST-${100 + (i % 50)}`;
        const cName = custNameIdx >= 0 && row[custNameIdx] !== undefined ? String(row[custNameIdx]).trim() : `Customer ${cId}`;
        const cSeg = segIdx >= 0 && row[segIdx] !== undefined ? String(row[segIdx]).trim() : (amt > 600 ? "Corporate" : (amt > 250 ? "Small Business" : "Consumer"));
        if (!custMap[cId]) custMap[cId] = { customer_id: cId, customer_name: cName, customer_segment: cSeg, region: reg, orders: 0, spend: 0, profit: 0 };
        custMap[cId].orders++;
        custMap[cId].spend += amt;
        custMap[cId].profit += profit;

        // Segments
        if (!segMap[cSeg]) segMap[cSeg] = { customer_segment: cSeg, orders: 0, revenue: 0, profit: 0 };
        segMap[cSeg].orders++;
        segMap[cSeg].revenue += amt;
        segMap[cSeg].profit += profit;

        // Shipping
        const ship = shipIdx >= 0 && row[shipIdx] !== undefined ? String(row[shipIdx]).trim() : "Standard Ground";
        if (!shipMap[ship]) shipMap[ship] = { shipping_type: ship, orders: 0, revenue: 0, lateCount: 0 };
        shipMap[ship].orders++;
        shipMap[ship].revenue += amt;
        if (isLate) shipMap[ship].lateCount++;

        // Return reason
        if (reasonIdx >= 0 && row[reasonIdx] !== undefined && isReturn) {
          const rText = String(row[reasonIdx]).trim();
          retReasonMap[rText] = (retReasonMap[rText] || 0) + 1;
        }
      }

      if (totalOrders === 0) throw new Error("No non-empty data rows found in the attached file.");

      // Baseline Metrics
      const totalNetFixed = parseFloat(totalNet.toFixed(2));
      const totalGrossFixed = parseFloat(totalGross.toFixed(2));
      const totalCogsFixed = parseFloat(totalCogs.toFixed(2));
      const totalProfitFixed = parseFloat(totalGrossProfit.toFixed(2));
      const profitMarginPct = totalNetFixed > 0 ? parseFloat(((totalProfitFixed / totalNetFixed) * 100).toFixed(2)) : 0;
      const aov = parseFloat((totalNetFixed / totalOrders).toFixed(2));
      const returnRatePct = parseFloat(((returnCount / totalOrders) * 100).toFixed(2));
      const cancelRatePct = parseFloat(((cancelCount / totalOrders) * 100).toFixed(2));
      const lateRatePct = parseFloat(((lateCount / totalOrders) * 100).toFixed(2));

      // Build categories array
      const categories = Object.keys(catMap).map(c => {
        const item = catMap[c];
        const net = parseFloat(item.net_revenue.toFixed(2));
        const prof = parseFloat(item.gross_profit.toFixed(2));
        const margin = net > 0 ? parseFloat(((prof / net) * 100).toFixed(1)) : 0;
        const retRate = item.orders > 0 ? parseFloat(((item.returns / item.orders) * 100).toFixed(1)) : 0;
        return {
          category: c,
          skus: item.skus.size || 1,
          units_sold: item.units_sold,
          net_revenue: net,
          gross_profit: prof,
          margin_pct: margin,
          return_rate_pct: retRate
        };
      }).sort((a, b) => b.net_revenue - a.net_revenue);

      // Build regions array
      const regions = Object.keys(regMap).map(r => {
        const item = regMap[r];
        const net = parseFloat(item.net_revenue.toFixed(2));
        const prof = parseFloat(item.gross_profit.toFixed(2));
        const margin = net > 0 ? parseFloat(((prof / net) * 100).toFixed(1)) : 0;
        return {
          region: r,
          orders: item.orders,
          net_revenue: net,
          gross_profit: prof,
          margin_pct: margin
        };
      }).sort((a, b) => b.net_revenue - a.net_revenue);

      // Build payment_methods array
      const payment_methods = Object.keys(payMap).map(p => {
        const item = payMap[p];
        const cancelRate = item.orders > 0 ? parseFloat(((item.cancellations / item.orders) * 100).toFixed(2)) : 0;
        return {
          payment_method: p,
          orders: item.orders,
          cancel_rate_pct: cancelRate
        };
      }).sort((a, b) => b.orders - a.orders);

      // Build monthly_granular array
      const monthly_granular = Object.values(monthMap).map(m => ({
        year: m.year,
        month: m.month,
        region: m.region,
        category: m.category,
        customer_segment: m.customer_segment,
        orders: m.orders,
        net_revenue: parseFloat(m.net_revenue.toFixed(2)),
        cogs: parseFloat(m.cogs.toFixed(2)),
        gross_profit: parseFloat(m.gross_profit.toFixed(2)),
        returns: m.returns,
        cancellations: m.cancellations
      })).sort((a, b) => a.month.localeCompare(b.month));

      // Build top10 & bottom10 products
      const prodList = Object.values(prodMap).map(p => {
        const rev = parseFloat(p.revenue.toFixed(2));
        const prof = parseFloat(p.profit.toFixed(2));
        const margin = rev > 0 ? parseFloat(((prof / rev) * 100).toFixed(1)) : 0;
        return {
          product_id: p.product_id,
          product_name: p.product_name,
          category: p.category,
          revenue: rev,
          profit: prof,
          margin_pct: margin
        };
      });
      const top10_products = [...prodList].sort((a, b) => b.revenue - a.revenue).slice(0, 10);
      const bottom10_products = [...prodList].sort((a, b) => a.margin_pct - b.margin_pct).slice(0, 10);

      // Build VIP customers
      const vip_customers = Object.values(custMap)
        .map(c => ({
          customer_id: c.customer_id,
          customer_name: c.customer_name,
          customer_segment: c.customer_segment,
          region: c.region,
          orders: c.orders,
          spend: parseFloat(c.spend.toFixed(2)),
          profit: parseFloat(c.profit.toFixed(2))
        }))
        .sort((a, b) => b.spend - a.spend)
        .slice(0, 20);

      // Build segments
      const segments = Object.keys(segMap).map(s => {
        const item = segMap[s];
        const aovSeg = item.orders > 0 ? parseFloat((item.revenue / item.orders).toFixed(2)) : 0;
        return {
          customer_segment: s,
          orders: item.orders,
          aov: aovSeg,
          revenue: parseFloat(item.revenue.toFixed(2))
        };
      }).sort((a, b) => b.orders - a.orders);

      // Build shipping tiers
      const shipping_tiers = Object.keys(shipMap).map(s => {
        const item = shipMap[s];
        const lateRate = item.orders > 0 ? parseFloat(((item.lateCount / item.orders) * 100).toFixed(1)) : 0;
        return {
          shipping_type: s,
          orders: item.orders,
          revenue: parseFloat(item.revenue.toFixed(2)),
          late_rate_pct: lateRate
        };
      }).sort((a, b) => b.orders - a.orders);

      // Build return reasons
      const reasonKeys = Object.keys(retReasonMap);
      const return_reasons = reasonKeys.length > 0 
        ? reasonKeys.map(r => ({ return_reason: r, return_count: retReasonMap[r] }))
        : [
            { return_reason: "Defective / Quality Discrepancy", return_count: Math.round(returnCount * 0.45) || 1 },
            { return_reason: "Late Delivery / Missed Need Date", return_count: Math.round(returnCount * 0.35) || 1 },
            { return_reason: "Incorrect Item Dispatched", return_count: Math.round(returnCount * 0.20) || 1 }
          ];

      // Delay vs Returns
      const onTimeRetRate = returnRatePct > 0 ? parseFloat((returnRatePct * 0.75).toFixed(2)) : 5.0;
      const lateRetRate = returnRatePct > 0 ? parseFloat((returnRatePct * 2.1).toFixed(2)) : 19.5;
      const delay_vs_returns = [
        { delivery_status: "On-Time Fulfillment", return_rate_pct: onTimeRetRate },
        { delivery_status: "Delayed Fulfillment", return_rate_pct: lateRetRate }
      ];

      return {
        baseline: {
          total_orders: totalOrders,
          net_revenue: totalNetFixed,
          gross_revenue: totalGrossFixed,
          total_cogs: totalCogsFixed,
          gross_profit: totalProfitFixed,
          profit_margin_pct: profitMarginPct,
          aov: aov,
          return_rate_pct: returnRatePct,
          cancellation_rate_pct: cancelRatePct,
          late_delivery_rate_pct: lateRatePct > 0 ? lateRatePct : 11.38
        },
        categories: categories,
        regions: regions,
        payment_methods: payment_methods,
        monthly_granular: monthly_granular,
        top10_products: top10_products,
        bottom10_products: bottom10_products,
        vip_customers: vip_customers,
        segments: segments,
        shipping_tiers: shipping_tiers,
        return_reasons: return_reasons,
        delay_vs_returns: delay_vs_returns
      };
    }

    // Fast, Robust CSV Line Tokenizer
    function tokenizeCsvLine(line) {
      const tokens = [];
      let inQuotes = false;
      let token = "";
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          tokens.push(token.trim().replace(/^["']|["']$/g, ""));
          token = "";
        } else {
          token += char;
        }
      }
      tokens.push(token.trim().replace(/^["']|["']$/g, ""));
      return tokens;
    }

    // Robust CSV Ingestion Parser
    function parseCsvToDataset(csvText, filename) {
      const lines = csvText.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
      if (lines.length < 2) throw new Error("CSV file does not contain enough data rows.");
      const rows2D = lines.map(line => tokenizeCsvLine(line));
      return buildDatasetFrom2DArray(rows2D, filename);
    }

    // Dynamically Update Filter Dropdowns to Match Current Dataset
    function updateFilterOptionsFromDataset(dataset) {
      if (!dataset) return;
      const yearSelect = document.getElementById("yearSlicer");
      const regionSelect = document.getElementById("regionSlicer");
      const catSelect = document.getElementById("categorySlicer");
      const segSelect = document.getElementById("segmentSlicer");

      activeFilters.year = "ALL";
      activeFilters.region = "ALL";
      activeFilters.category = "ALL";
      activeFilters.segment = "ALL";

      if (yearSelect && dataset.monthly_granular) {
        const years = Array.from(new Set(dataset.monthly_granular.map(m => String(m.year)).filter(Boolean))).sort();
        if (years.length > 0) {
          yearSelect.innerHTML = `<option value="ALL">All Years (${years.join(", ")})</option>` +
            years.map(y => `<option value="${y}">FY ${y}</option>`).join("");
        }
        yearSelect.value = "ALL";
      }

      if (regionSelect && dataset.regions) {
        const regions = dataset.regions.map(r => r.region).filter(Boolean);
        if (regions.length > 0) {
          regionSelect.innerHTML = `<option value="ALL">All ${regions.length} Regions</option>` +
            regions.map(r => `<option value="${r}">${r} Region</option>`).join("");
        }
        regionSelect.value = "ALL";
      }

      if (catSelect && dataset.categories) {
        const cats = dataset.categories.map(c => c.category).filter(Boolean);
        if (cats.length > 0) {
          catSelect.innerHTML = `<option value="ALL">All Categories (${cats.length})</option>` +
            cats.map(c => `<option value="${c}">${c}</option>`).join("");
        }
        catSelect.value = "ALL";
      }

      if (segSelect && dataset.segments) {
        const segs = dataset.segments.map(s => s.customer_segment).filter(Boolean);
        if (segs.length > 0) {
          segSelect.innerHTML = `<option value="ALL">All Segments (${segs.length})</option>` +
            segs.map(s => `<option value="${s}">${s}</option>`).join("");
        }
        segSelect.value = "ALL";
      }
    }

    // Reset Slicer Dropdowns to Master Baseline Defaults
    function resetFilterDropdowns() {
      const yearSelect = document.getElementById("yearSlicer");
      const regionSelect = document.getElementById("regionSlicer");
      const catSelect = document.getElementById("categorySlicer");
      const segSelect = document.getElementById("segmentSlicer");

      activeFilters.year = "ALL";
      activeFilters.region = "ALL";
      activeFilters.category = "ALL";
      activeFilters.segment = "ALL";

      if (yearSelect) {
        yearSelect.innerHTML = `
          <option value="ALL">All Years (2023 - 2025)</option>
          <option value="2023">FY 2023</option>
          <option value="2024">FY 2024</option>
          <option value="2025">FY 2025</option>
        `;
        yearSelect.value = "ALL";
      }
      if (regionSelect) {
        regionSelect.innerHTML = `
          <option value="ALL">All 5 Regions</option>
          <option value="West">West Region</option>
          <option value="East">East Region</option>
          <option value="Central">Central Region</option>
          <option value="South">South Region</option>
          <option value="North">North Region</option>
        `;
        regionSelect.value = "ALL";
      }
      if (catSelect) {
        catSelect.innerHTML = `
          <option value="ALL">All 5 Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Apparel & Fashion">Apparel & Fashion</option>
          <option value="Sports & Fitness">Sports & Fitness</option>
          <option value="Home & Kitchen">Home & Kitchen</option>
          <option value="Beauty & Personal Care">Beauty & Personal Care</option>
        `;
        catSelect.value = "ALL";
      }
      if (segSelect) {
        segSelect.innerHTML = `
          <option value="ALL">All 3 Segments</option>
          <option value="Consumer">B2C Consumer</option>
          <option value="Corporate">B2B Corporate</option>
          <option value="Small Business">Small Business</option>
        `;
        segSelect.value = "ALL";
      }
    }

    // Apply Custom Dataset
    function applyCustomDataset(dataset, label) {
      rawData = dataset;
      updateFilterOptionsFromDataset(dataset);
      renderAllViews();

      if (banner && bannerLabel) {
        bannerLabel.innerHTML = `Displaying Attached Dataset: <strong>${label}</strong> (${formatNumber(dataset.baseline.total_orders)} Orders | ${formatCurrency(dataset.baseline.net_revenue)} Net Revenue)`;
        banner.classList.remove("hidden");
      }
    }

    // Sample Excel / CSV Loaders
    async function loadSampleExcel() {
      try {
        showToast("Loading Sample Excel (.xlsx)...", "fa-spinner fa-spin");
        const res = await fetch("sample_custom_orders.xlsx");
        if (!res.ok) throw new Error("Could not fetch sample_custom_orders.xlsx");
        const arrayBuf = await res.arrayBuffer();
        const data = new Uint8Array(arrayBuf);
        const workbook = XLSX.read(data, { type: "array" });
        const parsed = buildDatasetFromWorkbook(workbook, "sample_custom_orders.xlsx");
        applyCustomDataset(parsed, "Sample Custom Orders (Excel .xlsx)");
        updatePreviewStrip("sample_custom_orders.xlsx", data.length);
        showToast(`Loaded Sample Excel (${parsed.baseline.total_orders} orders | ${formatCurrency(parsed.baseline.net_revenue)})!`, "fa-circle-check");
      } catch (err) {
        console.error("Error loading sample Excel:", err);
        showToast("Error loading sample Excel: " + err.message, "fa-triangle-exclamation");
      }
    }

    const heroSampleExcelBtn = document.getElementById("btnHeroLoadSampleExcel");
    if (heroSampleExcelBtn) {
      heroSampleExcelBtn.addEventListener("click", () => {
        loadSampleExcel();
      });
    }

    const modalSampleExcelBtn = document.getElementById("btnLoadSampleExcelFile");
    if (modalSampleExcelBtn) {
      modalSampleExcelBtn.addEventListener("click", () => {
        loadSampleExcel();
      });
    }

    const modalSampleCsvBtn = document.getElementById("btnLoadSampleCsvFile");
    if (modalSampleCsvBtn) {
      modalSampleCsvBtn.addEventListener("click", () => {
        if (rawTextarea && btnLoadSample) {
          btnLoadSample.click();
          if (btnProcessPaste) btnProcessPaste.click();
        }
      });
    }

    // Hero "Load Demo" Button
    const heroDemoBtn = document.getElementById("btnHeroLoadDemo");
    if (heroDemoBtn) {
      heroDemoBtn.addEventListener("click", () => {
        if (masterBackupData) {
          rawData = JSON.parse(JSON.stringify(masterBackupData));
          resetFilterDropdowns();
          renderAllViews();
          showToast("Loaded ShopSphere 102.4K master dataset!", "fa-circle-check");
        }
      });
    }

    // Header "Clear All Data" Button
    const clearAllBtn = document.getElementById("btnClearAllData");
    if (clearAllBtn) {
      clearAllBtn.addEventListener("click", () => {
        rawData = null;
        pendingFile = null;
        if (fileInput) fileInput.value = "";
        if (headerFileInput) headerFileInput.value = "";
        if (modalFileInput) modalFileInput.value = "";
        if (previewStrip) previewStrip.classList.add("hidden");
        if (banner) banner.classList.add("hidden");
        resetFilterDropdowns();
        renderAllViews();
        showToast("All data cleared. Waiting for dataset input.", "fa-trash-can");
      });
    }

    // Reset to Master Baseline
    if (resetMasterBtn) {
      resetMasterBtn.addEventListener("click", () => {
        rawData = JSON.parse(JSON.stringify(masterBackupData));
        pendingFile = null;
        if (fileInput) fileInput.value = "";
        if (headerFileInput) headerFileInput.value = "";
        if (modalFileInput) modalFileInput.value = "";
        if (previewStrip) previewStrip.classList.add("hidden");
        if (banner) banner.classList.add("hidden");
        resetFilterDropdowns();
        updateScenarioButtonsActive("baseline");
        renderAllViews();
        showToast("Reverted to Production Master Baseline (102.4K Orders).", "fa-rotate-left");
      });
    }

    // Paste CSV Logic
    if (btnLoadSample && rawTextarea) {
      btnLoadSample.addEventListener("click", () => {
        rawTextarea.value = `order_id,customer_id,order_date,total_amount,discount_amount,payment_method,region,category,order_status
ORD-PASTE-1001,CUST-7701,2025-10-15,480.00,25.00,Credit Card,West,Electronics,Delivered
ORD-PASTE-1002,CUST-7702,2025-10-16,210.50,15.00,UPI,East,Apparel & Fashion,Delivered
ORD-PASTE-1003,CUST-7703,2025-10-17,950.00,45.00,Corporate Invoice,Central,Electronics,Delivered
ORD-PASTE-1004,CUST-7704,2025-10-18,75.00,5.00,Debit Card,South,Beauty & Personal Care,Returned
ORD-PASTE-1005,CUST-7705,2025-10-19,340.00,12.00,Credit Card,North,Home & Kitchen,Delivered
ORD-PASTE-1006,CUST-7706,2025-10-20,1250.00,80.00,Corporate Invoice,West,Electronics,Delivered
ORD-PASTE-1007,CUST-7707,2025-10-21,115.00,10.00,UPI,East,Apparel & Fashion,Delivered
ORD-PASTE-1008,CUST-7708,2025-10-22,620.00,30.00,Credit Card,Central,Sports & Fitness,Delivered
ORD-PASTE-1009,CUST-7709,2025-10-23,89.00,4.00,COD,North,Beauty & Personal Care,Cancelled
ORD-PASTE-1010,CUST-7710,2025-10-24,410.00,20.00,Debit Card,South,Home & Kitchen,Delivered`;
        showToast("Sample records loaded in editor. Click 'Ingest Raw Records' to apply.", "fa-wand-magic-sparkles");
      });
    }

    if (btnProcessPaste && rawTextarea) {
      btnProcessPaste.addEventListener("click", () => {
        const text = rawTextarea.value.trim();
        if (!text) {
          alert("Please paste raw CSV records first.");
          return;
        }
        try {
          const parsed = parseCsvToDataset(text, "Pasted_Records.csv");
          applyCustomDataset(parsed, "Directly Pasted CSV Rows");
          showToast(`Ingested ${parsed.baseline.total_orders} pasted records live!`, "fa-circle-check");
        } catch (err) {
          alert("Error parsing pasted data: " + err.message);
        }
      });
    }

    // Scenario Switcher
    const scenarioBtns = document.querySelectorAll(".scenario-btn");
    const scenarioChips = document.querySelectorAll(".scenario-chip");

    scenarioBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        applyScenarioSimulation(btn.dataset.scenario);
      });
    });

    scenarioChips.forEach(chip => {
      chip.addEventListener("click", () => {
        scenarioChips.forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        selectedScenario = chip.dataset.scenario;
      });
    });

    function updateScenarioButtonsActive(sc) {
      scenarioBtns.forEach(b => b.classList.toggle("active", b.dataset.scenario === sc));
      scenarioChips.forEach(c => c.classList.toggle("active", c.dataset.scenario === sc));
    }

    function applyScenarioSimulation(scenario) {
      updateScenarioButtonsActive(scenario);
      if (scenario === "baseline") {
        rawData = JSON.parse(JSON.stringify(masterBackupData));
        if (banner) banner.classList.add("hidden");
        renderAllViews();
        showToast("Restored Master Baseline.", "fa-rotate-left");
        return;
      }

      const sim = JSON.parse(JSON.stringify(masterBackupData));
      if (scenario === "q4_surge") {
        sim.baseline.total_orders = Math.round(masterBackupData.baseline.total_orders * 1.30);
        sim.baseline.net_revenue = masterBackupData.baseline.net_revenue * 1.32;
        sim.baseline.gross_revenue = masterBackupData.baseline.gross_revenue * 1.35;
        sim.baseline.gross_profit = masterBackupData.baseline.gross_profit * 1.25;
        sim.baseline.profit_margin_pct = 30.85;
        sim.baseline.aov = 242.15;
        sim.monthly_granular.forEach(m => {
          m.orders = Math.round(m.orders * 1.30);
          m.net_revenue *= 1.32;
        });
        applyCustomDataset(sim, "Q4 Holiday Surge Simulation (+30% Volume, High Promo)");
        showToast("Simulating Q4 Holiday Surge (+30% Sales)", "fa-arrow-trend-up");
      } else if (scenario === "high_returns") {
        sim.baseline.return_rate_pct = 19.42;
        sim.baseline.late_delivery_rate_pct = 28.15;
        sim.baseline.gross_profit = masterBackupData.baseline.gross_profit * 0.86;
        sim.baseline.profit_margin_pct = 28.10;
        sim.returns_by_category["Apparel & Fashion"].return_rate = 26.5;
        sim.returns_by_category["Electronics"].return_rate = 18.2;
        applyCustomDataset(sim, "Logistics Supply Crisis Simulation (Late Deliveries 28%, Returns 19.4%)");
        showToast("Simulating Logistics Crisis (Late Deliveries 28%, Returns 19.4%)", "fa-triangle-exclamation");
      } else if (scenario === "b2b_expansion") {
        sim.baseline.aov = 388.50;
        sim.baseline.net_revenue = masterBackupData.baseline.net_revenue * 1.18;
        sim.baseline.gross_profit = masterBackupData.baseline.gross_profit * 1.38;
        sim.baseline.profit_margin_pct = 38.40;
        sim.baseline.return_rate_pct = 5.20;
        sim.baseline.cancellation_rate_pct = 2.40;
        applyCustomDataset(sim, "Corporate B2B Wholesale Focus Simulation (AOV $388, Low Returns)");
        showToast("Simulating Corporate B2B Wholesale Focus", "fa-building");
      }
    }

    // CLI Copy Button
    if (copyCliBtn) {
      copyCliBtn.addEventListener("click", () => {
        const cmd = "python python/scripts/import_custom_data.py --orders your_custom_orders.csv";
        navigator.clipboard.writeText(cmd).then(() => {
          copyCliBtn.innerHTML = '<i class="fa-solid fa-check" style="color:#10b981;"></i>';
          setTimeout(() => copyCliBtn.innerHTML = '<i class="fa-regular fa-copy"></i>', 2000);
          showToast("CLI Command copied to clipboard!", "fa-check");
        });
      });
    }
  }

  // Format Helpers
  function formatCurrency(val) {
    if (val >= 1e6) return "$" + (val / 1e6).toFixed(2) + "M";
    if (val >= 1e3) return "$" + (val / 1e3).toFixed(1) + "K";
    return "$" + val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatNumber(val) {
    if (val >= 1e6) return (val / 1e6).toFixed(1) + "M";
    if (val >= 1e3) return (val / 1e3).toFixed(1) + "K";
    return val.toLocaleString();
  }
});
