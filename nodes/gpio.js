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
const pin_mode_str = [
    "ALT0",
    "ALT1",
    "ALT2",
    "ALT3",
    "ALT4",
    "ALT5",
    "ALT6",
    "ALT7",
    "DIN",
    "DOUT",
    "AIN",
    "AOUT",
    "PWM"
];
const pin_pud_str = ["PULL_OFF", "PULL_DOWN", "PULL_UP"];

module.exports = function(RED) {
    /*
     * lot.Gpio(pin)
     * lot.Gpio.mode(mode)
     */
    function lot_Gpio_mode_node(config) {
        RED.nodes.createNode(this, config);

        const node = this;
        const pin = parseInt(RED.nodes.getNode(config.pin).pin);
        let mode = parseInt(config.mode);

        if (!(pin in active_gpio_list)) {
            active_gpio_list[pin] = new lot.Gpio(pin);
        }

        active_gpio_list[pin].mode(mode);

        node.status({
            fill: "green",
            shape: "dot",
            text: pin + "-" + pin_mode_str[mode]
        });

        node.on("input", msg => {
            if (msg.payload.mode != undefined) {
                mode = parseInt(msg.payload.mode);
                active_gpio_list[pin].mode(mode);
                node.send(msg);
            } else {
                mode = active_gpio_list[pin].mode();
                msg.payload = { mode: mode };
                node.send(msg);
            }
            node.status({
                fill: "green",
                shape: "dot",
                text: pin + "-" + pin_mode_str[mode]
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
        let pud = parseInt(config.pud);

        if (!(pin in active_gpio_list)) {
            active_gpio_list[pin] = new lot.Gpio(pin);
        }

        active_gpio_list[pin].pull_up_down(pud);

        function pud_status(pud) {
            let status = {};
            switch (pud) {
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
                text: pin + "-" + pin_pud_str[pud]
            });
        }

        pud_status(pud);

        node.on("input", msg => {
            if (msg.payload.pud != undefined) {
                pud = parseInt(msg.payload.pud);
                active_gpio_list[pin].pull_up_down(pud);
                node.send(msg);
            } else {
                pud = active_gpio_list[pin].pull_up_down();
                msg.payload = { pud: pud };
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
            const status = active_gpio_list[pin].toggle();
            if (status == lot.HIGH) {
                node.status({
                    fill: "red",
                    shape: "dot",
                    text: pin + "-HIGH"
                });
            } else {
                node.status({
                    fill: "grey",
                    shape: "ring",
                    text: pin + "-LOW"
                });
            }
            msg.payload = { status: status };
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
