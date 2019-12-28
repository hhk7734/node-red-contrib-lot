/*
 * MIT License
 * Copyright (c) 2019 Seungwoo Hong <qksn1541@gmail.com>
 * Copyright (c) 2019 Hyeonki Hong <hhk7734@gmail.com>
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

module.exports = function(RED) {
    function lot_set_pin_mode_node(config) {
        RED.nodes.createNode(this, config);

        this.status({
            fill: "green",
            shape: "dot",
            text: config.pin + "-" + config.mode
        });

        lot.set_pin_mode(parseInt(config.pin), config.mode);
    }
    RED.nodes.registerType("lot-set-pin-mode", lot_set_pin_mode_node);

    function lot_digital_write_node(config) {
        RED.nodes.createNode(this, config);
        let node = this;

        this.on("input", function(msg) {
            lot.digital_write(parseInt(config.pin), msg.payload);

            if (msg.payload == "HIGH") {
                node.status({
                    fill: "red",
                    shape: "dot",
                    text: config.pin + "-HIGH"
                });
            } else {
                node.status({
                    fill: "grey",
                    shape: "ring",
                    text: config.pin + "-LOW"
                });
            }

            node.send(msg);
        });
    }
    RED.nodes.registerType("lot-digital-write", lot_digital_write_node);
};
