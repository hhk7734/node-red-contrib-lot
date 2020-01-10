/*
 * MIT License
 *
 * Copyright (c) 2019 Seungwoo Hong <qksn1541@gmail.com>
 * Copyright (c) 2019-2020 Hyeonki Hong <hhk7734@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const lot = require("lot-gpio");

let active_gpio_list = {};
const pin_map = {
    mode: {
        [lot.ALT0]: "lot.ALT0",
        [lot.ALT1]: "lot.ALT1",
        [lot.ALT2]: "lot.ALT2",
        [lot.ALT3]: "lot.ALT3",
        [lot.ALT4]: "lot.ALT4",
        [lot.ALT5]: "lot.ALT5",
        [lot.ALT6]: "lot.ALT6",
        [lot.ALT7]: "lot.ALT7",
        [lot.DIN]: "lot.DIN",
        [lot.DOUT]: "lot.DOUT",
        [lot.AIN]: "lot.AIN",
        [lot.AOUT]: "lot.AOUT",
        [lot.PWM]: "lot.PWM",
        "lot.ALT0": lot.ALT0,
        "lot.ALT1": lot.ALT1,
        "lot.ALT2": lot.ALT2,
        "lot.ALT3": lot.ALT3,
        "lot.ALT4": lot.ALT4,
        "lot.ALT5": lot.ALT5,
        "lot.ALT6": lot.ALT6,
        "lot.ALT7": lot.ALT7,
        "lot.DIN": lot.DIN,
        "lot.DOUT": lot.DOUT,
        "lot.AIN": lot.AIN,
        "lot.AOUT": lot.AOUT,
        "lot.PWM": lot.PWM
    },
    pud: {
        [lot.PULL_OFF]: "lot.PULL_OFF",
        [lot.PULL_DOWN]: "lot.PULL_DOWN",
        [lot.PULL_UP]: "lot.PULL_UP",
        "lot.PULL_OFF": lot.PULL_OFF,
        "lot.PULL_DOWN": lot.PULL_DOWN,
        "lot.PULL_UP": lot.PULL_UP
    },
    status: {
        [lot.LOW]: "lot.LOW",
        [lot.HIGH]: "lot.HIGH",
        "lot.LOW": lot.LOW,
        "lot.HIGH": lot.HIGH
    }
};

module.exports = function(RED) {
    /*
     * lot.Gpio.mode(mode)
     */
    function lot_Gpio_mode_node(config) {
        RED.nodes.createNode(this, config);

        const node = this;
        const pin = parseInt(RED.nodes.getNode(config.pin).pin);
        let mode = config.mode; // mode = string

        if (!(pin in active_gpio_list)) {
            active_gpio_list[pin] = new lot.Gpio(pin);
        }

        active_gpio_list[pin].mode(pin_map.mode[mode]);

        node.status({
            fill: "green",
            shape: "dot",
            text: pin + "-" + mode
        });

        node.on("input", msg => {
            if (msg.payload.mode != undefined) {
                mode = msg.payload.mode; // string
                active_gpio_list[pin].mode(pin_map.mode[mode]);
                node.send(msg);
            } else {
                mode = active_gpio_list[pin].mode(); // number
                mode = pin_map.mode[mode]; // number -> string
                if (typeof msg.payload === "object") {
                    msg.payload.mode = mode;
                } else {
                    msg.payload = { mode: mode };
                }
                node.send(msg);
            }
            node.status({
                fill: "green",
                shape: "dot",
                text: pin + "-" + mode
            });
        });

        node.on("close", () => {
            delete active_gpio_list[pin];
        });
    }
    RED.nodes.registerType("lot.Gpio.mode", lot_Gpio_mode_node);

    /*
     * lot.Gpio.pull_up_down()
     */
    function lot_Gpio_pull_up_down_node(config) {
        RED.nodes.createNode(this, config);

        const node = this;
        const pin = parseInt(RED.nodes.getNode(config.pin).pin);
        let pud = config.pud; // string

        if (!(pin in active_gpio_list)) {
            active_gpio_list[pin] = new lot.Gpio(pin);
        }

        active_gpio_list[pin].pull_up_down(pin_map.pud[pud]);

        function pud_status(pud) {
            let status = {};
            switch (pin_map.pud[pud]) {
                case lot.PULL_OFF:
                    status.fill = "grey";
                    status.shape = "ring";
                    break;
                case lot.PULL_DOWN:
                    status.fill = "blue";
                    status.shape = "dot";
                    break;
                case lot.PULL_UP:
                    status.fill = "red";
                    status.shape = "dot";
                    break;
            }
            node.status({
                fill: status.fill,
                shape: status.shape,
                text: pin + "-" + pud
            });
        }

        pud_status(pud);

        node.on("input", msg => {
            if (msg.payload.pud != undefined) {
                pud = msg.payload.pud; // string
                active_gpio_list[pin].pull_up_down(pin_map.pud[pud]);
                node.send(msg);
            } else {
                pud = active_gpio_list[pin].pull_up_down(); // number
                pud = pin_map.pud[pud]; // number -> string
                if (typeof msg.payload === "object") {
                    msg.payload.pud = pud;
                } else {
                    msg.payload = { pud: pud };
                }
                node.send(msg);
            }
            pud_status(pud);
        });

        node.on("close", () => {
            delete active_gpio_list[pin];
        });
    }
    RED.nodes.registerType("lot.Gpio.pull_up_down", lot_Gpio_pull_up_down_node);

    /*
     * lot.Gpio.toggle()
     */
    function lot_Gpio_toggle_node(config) {
        RED.nodes.createNode(this, config);

        const node = this;
        const pin = parseInt(RED.nodes.getNode(config.pin).pin);

        if (!(pin in active_gpio_list)) {
            active_gpio_list[pin] = new lot.Gpio(pin);
        }

        node.on("input", msg => {
            let status = active_gpio_list[pin].toggle(); // number
            status = pin_map.status[status]; // number -> string
            if (status == "lot.HIGH") {
                node.status({
                    fill: "red",
                    shape: "dot",
                    text: pin + "-" + status
                });
            } else {
                node.status({
                    fill: "grey",
                    shape: "ring",
                    text: pin + "-" + status
                });
            }
            if (typeof msg.payload === "object") {
                msg.payload.status = status;
            } else {
                msg.payload = { status: status };
            }
            node.send(msg);
        });

        node.on("close", () => {
            delete active_gpio_list[pin];
        });
    }
    RED.nodes.registerType("lot.Gpio.toggle", lot_Gpio_toggle_node);

    // lot.Gpio.toggle.button
    RED.httpAdmin.post(
        "/lot.Gpio.toggle/:id",
        RED.auth.needsPermission("lot.Gpio.toggle.write"),
        function(req, res) {
            const node = RED.nodes.getNode(req.params.id);
            if (node != null) {
                try {
                    node.receive();
                    res.sendStatus(200);
                } catch (err) {
                    res.sendStatus(500);
                    node.error(
                        RED._("lot.Gpio.toggle.failed", {
                            error: err.toString()
                        })
                    );
                }
            } else {
                res.sendStatus(404);
            }
        }
    );
};
