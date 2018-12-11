"use strict";

const url = "/data";

let label = [];
let lableCount = 0;
let chartWidth = 15;

const messages = {
    en: {
        message: {
            title: "Bioreactor Control Interface",
            temperature: "Temperature",
            stirR: "Stirring Rate",
            instruction: "Instruction",
            tempWarn: "Temperature should be within the range of 25-35",
            stirWarn: "Stirring Rate should be within the range of 500-1500",
            confirm: "Confirm",
            cancel: "Cancel",
            confirmation: "Confirmation",
            confirmIns: "Confirming Instruction",
            success: "Successfully submitted instructions for execution"
        }
    },
    fr: {
        message: {
            title: "Interface de Contrôle de Bioréacteur",
            temperature: "Température",
            stirR: "Taux d'agitation",
            instruction: "Instruction",
            tempWarn: "La température doit être comprise entre 25-35",
            stirWarn:
                "Le taux d'agitation doit être compris dans l'intervalle de 500-1500",
            confirm: "Confirmer",
            cancel: "Annuler",
            confirmation: "Confirmation",
            confirmIns: "Confirmation des instructions",
            success: "Soumis avec succès pour exécution"
        }
    },
    sw: {
        message: {
            title: "Interface ya kudhibiti bioreactor",
            temperature: "Joto",
            stirR: "Kuchochea kiwango",
            instruction: "Maagizo",
            tempWarn: "Joto linapaswa kuwa ndani ya aina mbalimbali 25-35",
            stirWarn:
                "Kiwango cha kuchochea lazima iwe ndani ya aina mbalimbali 500-1500",
            confirm: "Kuthibitisha",
            cancel: "Kufuta",
            confirmation: "Uthibitisho",
            confirmIns: "Kuthibitisha maagizo",
            success: "Imewasilishwa kwa ufanisi kwa ajili ya utekelezaji"
        }
    }
};
const i18n = new VueI18n({
    locale: "en",
    messages
});

let sensorData = new Vue({
    i18n,
    el: "#main",
    data: {
        temperature: null,
        stirringRate: null,
        tempForm: 25,
        stirForm: 2000,
        pH: null,
        modalActive: false,
        tempError: false,
        stirError: false,
        confirmActive: false,
        notifications: []
    },
    methods: {
        submitInstruction: function(event) {
            if (this.tempForm > 35 || this.tempForm < 25) {
                return (this.tempError = true);
            }
            if (this.stirForm > 1500 || this.stirForm < 500) {
            // if (false) {
                return (this.stirError = true);
            }

            return (this.confirmActive = true);
        },

        confirmInstruction: function(event) {
            let url = new URL("/instruct", "http://127.0.0.1:5000"),
                params = {
                    temperature: this.tempForm,
                    stirring: this.stirForm
                };

            Object.keys(params).forEach(key =>
                url.searchParams.append(key, params[key])
            );
            return fetch(url)
                .then(resp => resp.json())
                .then(data => {
                    if (data.status == "success") {
                        let ret = {
                            message:
                                i18n.messages[i18n.locale].message.success +
                                ` ID: ${data.id} | ${data.created_date}`
                        };
                        this.modalActive = false;
                        this.confirmActive = false;
                        return this.notifications.push(ret);
                    }
                });
        },
        removeNotification: function(index) {
            return this.notifications.splice(index, 1);
        },
        changeLang: function(lang){
            i18n.locale = lang;
            tempChart.update();
            stirChart.update();
            return;
        }
    }
});

let ctxtemp = document.getElementById("tempChart").getContext("2d");
let tempChart = new Chart(ctxtemp, {
    type: "line",
    data: {
        labels: [],
        datasets: [
            {
                label: i18n.messages[i18n.locale].message.temperature + " (°C)",
                borderColor: "rgb(255, 99, 132)",
                data: [],
                lineTension: 0.5
            }
        ]
    },
    options: {
        scales: {
            xAxes: [
                {
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: "Time"
                    },
                    ticks: {
                        autoSkip: true
                    }
                }
            ],
            yAxes: [
                {
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: "Value"
                    },
                    ticks: {
                        beginAtZero: true
                    }
                }
            ]
        }
    }
});
let ctxstir = document.getElementById("stirringChart").getContext("2d");
let stirChart = new Chart(ctxstir, {
    type: "line",
    data: {
        labels: [],
        datasets: [
            {
                label: i18n.messages[i18n.locale].message.stirR + " (RPM)",
                borderColor: "rgb(105,105,105)",
                data: [],
                lineTension: 0.5
            }
        ]
    },
    options: {
        scales: {
            xAxes: [
                {
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: "Time"
                    },
                    ticks: {
                        autoSkip: true
                    }
                }
            ],
            yAxes: [
                {
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: "Value"
                    },
                    ticks: {
                        beginAtZero: true
                    }
                }
            ]
        }
    }
});

function pushData(chart, data) {
    chart.data.datasets[0].data.push(data);
    chart.data.labels = label;

    if (chart.data.labels.length > chartWidth) {
        chart.data.datasets[0].data.shift();
    }

    chart.update();
    return 0;
}

window.addEventListener("load", function() {
    setInterval(() => {
        fetch(url)
            .then(resp => resp.json())
            .then(function(data) {
                sensorData.temperature = data.temperature;
                sensorData.stirringRate = data.stirringRate;
                sensorData.pH = data.pH;
                if (label.length <= chartWidth) {
                    label.push(lableCount);
                    lableCount += 1;
                }
                pushData(stirChart, sensorData.stirringRate);
                pushData(tempChart, sensorData.temperature);
            });
    }, 1000);
});

